PennController.ResetPrefix(null); 

// Sequence the blocks explicitly: Audio intro followed by randomized SPR items for that block
Sequence(
    "consent",
    "instructions", "practice",
    "audio-1", randomize("spr-1"), 
    "audio-2", randomize("spr-2"), 
    "audio-3", randomize("spr-3"), 
    "audio-4", randomize("spr-4"), 
    "audio-5", randomize("spr-5"), 
    "audio-6", randomize("spr-6"), 
    "audio-7", randomize("spr-7"), 
    "audio-8", randomize("spr-8"), 
    SendResults(), 
    "end"
)

Header(
    newVar("ID").global()    
)
.log("id" , getVar("ID")) 


newTrial("consent",
    // 1. Display your clean consent form
    newHtml("consent_form", "consent2.html")
        .print()
    ,
    newText("prompt", "<br><hr><br><p style='text-align: center; font-size: 1.1em;'><strong>Please enter your Prolific ID to proceed:</strong></p>")
        .print()
    ,
    // 2. Simple text input box
    newTextInput("prolificID")
        .settings.log()
        .settings.lines(1)
        .center()
        .print()
        .log()
    ,
    newText("<br><br>")
        .print()
    ,
    // Simple button to move past the trial
    newButton("continue", "I Consent.")
        .print()
        .wait()
)


// Instructions
newTrial("instructions", 
    defaultText.center().print()
    ,
    newText("Welcome!")
    ,
    newText("In this study, you will read text messages from a few different people.")
    ,
    newText("Then, you will answer questions about each message.")
    ,
    newText("Press the spacebar to progress through the words.\n\n")
    ,
    newText("The first few texts come from Emily and are meant to help you practice.")
    ,
    newText("After that, you'll play audio clips to get introduced to the other people in the study.")
    ,
    newButton("Start")
        .center()
        .print()
        .wait()
)


// ==============================
// Practice
// ==============================


Template(GetTable("epcaa_practice.csv"),
    row => newTrial("practice",
        // Display name Header
        newCanvas("headerCanvas", 500, 50)
            .css({
                "background-color": "#EFEFEF",
                "border": "1px solid #CCC",
                "border-radius": "4px",
                "margin-bottom": "15px",
                "display": "flex",              // Turns the canvas into a flex container
                "justify-content": "center",   // Centers horizontally
                "align-items": "center"        // Centers vertically
            })
            .center()
            .add("center", "center", 
                newText("headerName", "Emily")
                    .bold()
                    .css("font-size", "1.4em")
            )
            .print()
        ,
        
        // First message: single bubble with topic text
        newImage("sb1topicimg", "sb_thin.png")
            .settings.size(425, 57) 
        ,
        newImage("face1", "w0_face.png")
            .settings.size(100, 100)
        ,
        newText("sb1topictext", row.topic)
        ,
        newCanvas("sb1topiccanvas", 500, 258)
            .center()
            .add(75, 107, getImage("sb1topicimg"))
            .add(0, 158, getImage("face1"))
            .add(112, 120, getText("sb1topictext"))
            .print()
        ,
        newTimer(1500)
            .start()
            .wait()
        ,
        getCanvas("sb1topiccanvas").remove()
        ,
        // SPR part    
        newImage("sb1", "sb_double.png")
            .settings.size(425, 170)
        ,
        newImage("face2", "w0_face.png")
            .settings.size(100, 100)
        ,
        newController("ds1", "DashedSentence", {s: row.sentence})
        ,
        newText("spaceReminder", "Press SPACEBAR to continue.")
            .css("font-size", "0.8em")
        ,
        newCanvas("sprcanv", 500, 258)
            .center()
            .add(75, 0, getImage("sb1"))
            .add(0, 158, getImage("face2"))
            .add(110, 25, getText("sb1topictext"))
            .add(110, 60, getController("ds1"))
            .add(200, 220, getText("spaceReminder"))
            .print()
        ,
        getController("ds1")
            .wait()
            .log()
        ,
        getCanvas("sprcanv").remove()
        ,
        getCanvas("headerCanvas").remove()
        ,
        // Ask comprehension question
        newText("questionText", row.question)
            .center()
            .bold()
            .print()
        ,
        newText("keyReminders", "Yes: [F]       |       No: [J]")
            .css("white-space", "pre")
            .center()
            .print()
        ,
        newKey("comp_question", "FYJNfyjn")
            .wait()
            .log() 
        ,
        getText("keyReminders")
            .remove()
        ,
        getText("questionText")
            .remove()
        ,
        newText("advanceText", "Press SPACEBAR to continue.")
            .center()
            .print()
        ,
        newKey("advanceTrial", " ")
            .wait()
    )
    //Log everything from the spreadsheet
    .log("item_id", row.item_id)
    .log("topic", row.topic)
    .log("sentence", row.sentence)
    .log("question", row.question)
    .log("answer", row.Answer)
    .log("trial_type", row.trial_type)
)



// ==========================================
// 1. AUDIO INTROS (Filtered from Master CSV)
// ==========================================
Template(GetTable("epcaa_all_lists.csv").filter("trial_type", "audio"),
    row => {
        
        // Randomize choices
        let choices = [row.audio_answer, row.audio_alt1, row.audio_alt2, row.audio_alt3].sort(() => Math.random() - 0.5);
        
        return newTrial("audio-" + row.block, // Dynamic label: "audio-1", "audio-2", etc.
    
        
        // Display name Header
        newCanvas("headerCanvas", 500, 50)
            .css({
                "background-color": "#EFEFEF",
                "border": "1px solid #CCC",
                "border-radius": "4px",
                "margin-bottom": "15px",
                "display": "flex",              // Turns the canvas into a flex container
                "justify-content": "center",   // Centers horizontally
                "align-items": "center"        // Centers vertically
            })
            .center()
            .add("center", "center", 
                newText("headerName", row.name)
                    .bold()
                    .css("font-size", "1.4em")
            )
            .print()
        ,
        
        // Speech bubble stuff
        newAudio("guiseAudio", row.audio)
        ,
        newImage("sbImage", "sb_thick.png")
            .settings.size(425, 110)
        ,
        newButton("playButton", "Play Introduction")
        ,
        newButton("nextButton", "Next")
        ,
        newImage("faceImage", row.image)
            .settings.size(100, 100)
        ,
        newCanvas("guiseAudioCanvas", 500, 202)
            .center()
            .add(75, 0, getImage("sbImage"))
            .add(0, 102, getImage("faceImage"))
            .add(200, 50, getButton("playButton"))
            .print()
        ,
        getButton("playButton")
            .wait()
            .remove()
        ,
        getAudio("guiseAudio")
            .play()
            .wait()
        ,
        // Remove audio canvas to clear the screen for the question
        getCanvas("guiseAudioCanvas")
            .remove()
        ,
        // Display Audio Comprehension Question
        newText("audioQ", row.audio_question)
            .bold()
            .center()
            .print()
        ,
        newScale("audioChoices", ...choices)
            .labelsPosition("right")
            .vertical()
            .center()
            .print()
            .wait()
            .log() // Logs the response to PCIbex results
        ,
        getText("audioQ").remove()
        ,
        getScale("audioChoices").remove()
        ,
        getCanvas("headerCanvas")
            .remove()
        ,
        newText("instructions", "Click on the button below to start reading. Click spacebar to proceed to the next word.")
            .print()
        ,
        newButton("Start reading")
            .print()
            .wait()
            .remove()
        ,
        getText("instructions")
            .remove()
    )
    .log("audio_question", row.audio_question)
    }
)


// ==========================================
// 2. SPR TRIALS (Filtered from Master CSV)
// ==========================================
Template(GetTable("epcaa_all_lists.csv").filter("trial_type", "spr"),
    row => newTrial("spr-" + row.block, // Dynamic label: "spr-1", "spr-2", etc.
        // Display name Header
        newCanvas("headerCanvas", 500, 50)
            .css({
                "background-color": "#EFEFEF",
                "border": "1px solid #CCC",
                "border-radius": "4px",
                "margin-bottom": "15px",
                "display": "flex",              // Turns the canvas into a flex container
                "justify-content": "center",   // Centers horizontally
                "align-items": "center"        // Centers vertically
            })
            .center()
            .add("center", "center", 
                newText("headerName", row.name)
                    .bold()
                    .css("font-size", "1.4em")
            )
            .print()
        ,
        
        // First message: single bubble with topic text
        newImage("sb1topicimg", "sb_thin.png")
            .settings.size(425, 57) 
        ,
        newImage("face1", row.image)
            .settings.size(100, 100)
        ,
        newText("sb1topictext", row.topic)
        ,
        newCanvas("sb1topiccanvas", 500, 258)
            .center()
            .add(75, 107, getImage("sb1topicimg"))
            .add(0, 158, getImage("face1"))
            .add(112, 120, getText("sb1topictext"))
            .print()
        ,
        newTimer(1500)
            .start()
            .wait()
        ,
        getCanvas("sb1topiccanvas").remove()
        ,
        // SPR part    
        newImage("sb1", "sb_double.png")
            .settings.size(425, 170)
        ,
        newImage("face2", row.image)
            .settings.size(100, 100)
        ,
        newController("ds1", "DashedSentence", {s: row.sentence})
        ,
        newText("spaceReminder", "Press SPACEBAR to continue.")
            .css("font-size", "0.8em")
        ,
        newCanvas("sprcanv", 500, 258)
            .center()
            .add(75, 0, getImage("sb1"))
            .add(0, 158, getImage("face2"))
            .add(110, 25, getText("sb1topictext"))
            .add(110, 60, getController("ds1"))
            .add(200, 220, getText("spaceReminder"))
            .print()
        ,
        getController("ds1")
            .wait()
            .log()
        ,
        getCanvas("sprcanv").remove()
        ,
        getCanvas("headerCanvas").remove()
        ,
        // Ask comprehension question
        newText("questionText", row.question)
            .center()
            .bold()
            .print()
        ,
        newText("keyReminders", "Yes: [F]       |       No: [J]")
            .css("white-space", "pre")
            .center()
            .print()
        ,
        newKey("comp_question", "FYJNfyjn")
            .wait()
            .log() 
        ,
        getText("keyReminders")
            .remove()
        ,
        getText("questionText")
            .remove()
        ,
        newText("advanceText", "Press SPACEBAR to continue.")
            .center()
            .print()
        ,
        newKey("advanceTrial", " ")
            .wait()
    )
    //Log everything from the spreadsheet
    .log("list", row.list)
    .log("experimental_list", row.experimental_list)
    .log("block", row.block)
    .log("item_order", row.item_order)
    .log("item_id", row.item_id)
    .log("condition", row.Condition)
    .log("block_within_speaker", row.block_within_speaker)
    .log("name", row.name)
    .log("image", row.image)
    .log("guise", row.guise)
    .log("topic", row.topic)
    .log("sentence", row.sentence)
    .log("question", row.question)
    .log("answer", row.Answer)
    .log("trial_type", row.trial_type)
)

// Final screen
newTrial("end",
    newText("Thank you for your participation!")
        .center()
        .print()
    ,
    newText("<p><a href='https://virginiatech.qualtrics.com/jfe/form/SV_5bclydrvOCvbSke' target='_blank'>Click here to move to the next part of the study.</a></p>")
        .center()
        .print()
    ,
    newButton().wait()
)
.setOption("countsForProgressBar", false)