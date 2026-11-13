PennController.ResetPrefix(null);

PennController.DebugOff()

// Sequence the blocks explicitly: Audio intro followed by randomized SPR items for that block
// NEW: a headphone check ("hc-...") now runs right after consent, before the instructions.
//      Results are sent once right after the check (so failed checks are saved too),
//      and again at the end of the study.
Sequence(
    "consent",
    "hc-intro", "hc-calibration", randomize("hc"), "hc-evaluate", SendResults(), "hc-result",
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
        .css({
            "font-size": "1.2em",
            "padding": "12px 24px"
        })
        .center()
        .print()
        .wait()
)



// ==========================================================================
// HEADPHONE CHECK  (added)
// Based on the McDermott Lab HeadphoneCheck (Woods, Siegel, Traer & McDermott, 2017,
// Attention, Perception & Psychophysics). 3-AFC task: "Which sound was SOFTEST?"
// One of the three tones in each file is in antiphase across the stereo channels, so it is
// much quieter over headphones than over loudspeakers. 6 trials; pass = at least 5 correct.
// Audio files (in chunk_includes/): antiphase_HC_*.wav and noise_calib_stim.wav
// ==========================================================================
const HC_THRESHOLD       = 5;      // number correct (out of 6) needed to pass. Don't lower this.
const HC_BLOCK_FAILURES  = true;   // true: participants who fail cannot continue
const HC_STIMULI = [
    {file: "antiphase_HC_ISO.wav", correct: 2},
    {file: "antiphase_HC_IOS.wav", correct: 3},
    {file: "antiphase_HC_SOI.wav", correct: 1},
    {file: "antiphase_HC_SIO.wav", correct: 1},
    {file: "antiphase_HC_OSI.wav", correct: 2},
    {file: "antiphase_HC_OIS.wav", correct: 3}
];
const HC_LABELS = ["FIRST sound was SOFTEST", "SECOND sound was SOFTEST", "THIRD sound was SOFTEST"];

newTrial("hc-intro",
    newVar("hcTotalCorrect", 0).global()
    ,
    newVar("hcPassed", "no").global()
    ,
    newText("hc-intro-text",
        "<p><b>Headphone check</b></p>" +
        "<p>This study requires headphones. Please put on your headphones now " +
        "(earbuds are fine) and find a quiet place.</p>" +
        "<p>First you will set your volume, then you will do a short listening test.</p>")
        .css("font-size", "22px").center().print()
    ,
    newButton("hc-intro-continue", "Continue").center().print().wait()
)

newTrial("hc-calibration",
    newText("hc-cal-title", "<p><b>Level Calibration</b></p>").css("font-size", "24px").center().print()
    ,
    newText("hc-cal-1", "<p>First, set your computer volume to about 25% of maximum.</p>")
        .css("font-size", "22px").center().print()
    ,
    newText("hc-cal-2",
        "<p>Press the button, then turn up the volume on your computer until the " +
        "calibration noise is at a loud but comfortable level.</p>")
        .css("font-size", "22px").center().print()
    ,
    newAudio("hc-calib", "noise_calib_stim.wav")
    ,
    newButton("hc-play-cal", "Play calibration sound")
        .center().print()
        .callback(getAudio("hc-calib").play())
    ,
    newText("hc-cal-3",
        "<p>You can play it as many times as you like. " +
        "Press <b>Continue</b> when level calibration is complete.</p>")
        .css("font-size", "20px").center().print()
    ,
    newButton("hc-cal-continue", "Continue")
        .center().print()
        .wait(getAudio("hc-calib").test.hasPlayed())   // only after playing it at least once
)

HC_STIMULI.forEach(s => {
    newTrial("hc",
        newText("hc-instr",
            "<p>When you hit <b>Play</b>, you will hear three sounds separated by silences.</p>" +
            "<p>Simply judge WHICH SOUND WAS SOFTEST (quietest): 1, 2, or 3?</p>" +
            "<p>Test sounds can only be played once!</p>")
            .css("font-size", "22px").center().print()
        ,
        newAudio("hc-tone", s.file)
        ,
        newButton("hc-play", "Play").center().print().wait()
        ,
        getButton("hc-play").remove()
        ,
        newText("hc-playing", "<p>Playing...</p>").css("font-size", "22px").center().print()
        ,
        getAudio("hc-tone").play().wait()      // waits until the sound has finished
        ,
        getText("hc-playing").remove()
        ,
        newText("hc-opt1", "<p>" + HC_LABELS[0] + "</p>").css("font-size", "22px").center().print()
        ,
        newText("hc-opt2", "<p>" + HC_LABELS[1] + "</p>").css("font-size", "22px").center().print()
        ,
        newText("hc-opt3", "<p>" + HC_LABELS[2] + "</p>").css("font-size", "22px").center().print()
        ,
        newSelector("hc-answer")
            .add(getText("hc-opt1"), getText("hc-opt2"), getText("hc-opt3"))
            .frame("solid 3px black")
            .log()
        ,
        newButton("hc-next", "Continue")
            .center().print()
            .wait(getSelector("hc-answer").test.selected())   // an answer is required
        ,
        newVar("hcIsCorrect", 0).log()    // logged with its final value (1 = correct)
        ,
        getSelector("hc-answer").test.selected(getText("hc-opt" + s.correct))
            .success(
                getVar("hcIsCorrect").set(1),
                getVar("hcTotalCorrect").set(v => v + 1)
            )
    )
    .log("hc_audio", s.file)
    .log("hc_correct_answer", s.correct)
});

// Score (no display)
const hcPassTests = [];
for (let k = HC_THRESHOLD; k <= HC_STIMULI.length; k++) {
    hcPassTests.push(
        getVar("hcTotalCorrect").test.is(k).success(getVar("hcPassed").set("yes"))
    );
}
newTrial("hc-evaluate",
    ...hcPassTests,
    newTimer("hc-eval-pause", 10).start().wait()
)
.log("hc_total_correct", getVar("hcTotalCorrect"))
.log("hc_passed", getVar("hcPassed"))

// Result screen (shown after the first SendResults)
newTrial("hc-result",
    getVar("hcPassed").test.is("yes")
        .success(
            newText("hc-pass-msg",
                "<p>Thank you, you passed the headphone check.</p>" +
                "<p>Please keep your headphones on for the rest of the study.</p>")
                .css("font-size", "22px").center().print()
            ,
            newButton("hc-pass-continue", "Continue").center().print().wait()
        )
        .failure(
            newText("hc-fail-msg",
                "<p>Sorry, it looks like you are not using headphones.</p>" +
                (HC_BLOCK_FAILURES
                    ? "<p>You cannot continue with this study. You can close this window now. Thank you for your time.</p>"
                    : "<p>Please put on headphones before you continue.</p>"))
                .css("font-size", "22px").center().print()
            ,
            (HC_BLOCK_FAILURES
                ? newTimer("hc-hold", 86400000).start().wait()          // stay here: no way forward
                : newButton("hc-fail-continue", "Continue").center().print().wait())
        )
)

// Instructions
newTrial("instructions", 
    //defaultText.center().print()
    defaultText.css("text-align", "center").center().print()
    ,
    newText("Welcome!<br><br>")
    ,
    newText("In this study, you will read text messages from a few different people.")
    ,
    newText("Then, you will answer questions about each message.")
    ,
    newText("Press the spacebar to progress through the words.<br><br>")
    ,
    newText("The first few texts come from Emily and are meant to help you practice.<br>After that, you'll play audio clips to get introduced to the other people in the study.")
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
                "display": "flex",                // Turns the canvas into a flex container
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
    .log("answer", row.answer)
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
        
        // Warn participant that new speaker is coming
        newText("intro_text", "Now you’ll be reading texts from a new person. Press the “Start Introduction” button to learn about them. After that, you'll answer a question about what you heard.")
            .center()
            .print()
        ,
        newText("blank_space", "<br>")
            .print()
        ,
        // Display "Play Introduction" button and wait for click
        newButton("play_intro_btn", "Start Introduction")
            .center()
            .print()
            .wait()
        ,
        // Clear the initial instruction and button from screen
        getText("intro_text").remove()
        ,
        getText("blank_space").remove()
        ,
        getButton("play_intro_btn").remove()
        ,
        
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
