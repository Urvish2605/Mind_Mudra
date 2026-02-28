
// ================= VRIKSHASANA STATE =================
// ================= VRIKSHASANA STATE =================
// let holdFrames = 0;
// let poseActive = false;
// let detectionLostFrames = 0;
// let cleanFrames = 0; // counts how long posture is correct
// const CLEAN_THRESHOLD = 45; // 1.5 seconds stable posture

// // ----- COACH TIMER -----
// let evaluationFrames = 0;
// const EVALUATION_TIME = 150; // 5 seconds @30fps

// // speech state machine
// let speechUnlocked = false;
// let isSpeaking = false;
// let lastSpokenMessage = "";
// let lastSpeechTime = 0;

// // ================= SPEECH ENGINE (FIXED) =================
// function unlockSpeech() {
//   if (speechUnlocked) return;

//   const u = new SpeechSynthesisUtterance("start");
//   u.volume = 0; // silent unlock for iOS + Chrome
//   speechSynthesis.speak(u);
//   speechSynthesis.resume();

//   speechUnlocked = true;
// }

// function speak(message) {
//   if (!message) return;
//   if (isSpeaking) return;
//   if (message === lastSpokenMessage) return;

//   lastSpokenMessage = message;
//   isSpeaking = true;

//   // stop any stuck speech
//   speechSynthesis.cancel();

//   const utter = new SpeechSynthesisUtterance(message);

//   // slightly faster but still natural
//   utter.rate = 1.12;
//   utter.pitch = 1;
//   utter.volume = 1;

//   utter.onend = () => {
//   isSpeaking = false;
//   evaluationFrames = 0;   // restart 5 sec timer AFTER speech
//    lastSpeechTime = Date.now();
//    lastSpokenMessage = "";  // ← ADD THIS — allows same correction to repeat next cycle
// };

//   utter.onerror = () => {
//   isSpeaking = false;
//   evaluationFrames = 0;
//    lastSpokenMessage = "";  // ← ADD THIS TOO
// };
// speechSynthesis.speak(utter);}

// // keep browser speech alive (VERY IMPORTANT FOR CHROME)
// setInterval(() => {
//   speechSynthesis.resume();
// }, 4000);

// // ================= MATH =================
// function calculate_angle(a, b, c) {
//   const radians =
//     Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);

//   let angle = Math.abs((radians * 180) / Math.PI);
//   return angle > 180 ? 360 - angle : angle;
// }

// // ================= MAIN =================
// async function startLiveFeedback() {
//   const video = document.getElementById("video");
//   const canvas = document.getElementById("canvas");
//   const ctx = canvas.getContext("2d");
//   const status = document.getElementById("status");

//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     video.srcObject = stream;
//     await new Promise((r) => (video.onloadedmetadata = r));

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     status.textContent = "Stand sideways and perform Vrikshasana (Tree Pose).";

//     const pose = new Pose({
//       locateFile: (f) =>
//         `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`,
//     });

//     pose.setOptions({
//       modelComplexity: 1,
//       smoothLandmarks: true,
//       minDetectionConfidence: 0.6,
//       minTrackingConfidence: 0.6,
//     });

//     pose.onResults((results) => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//       if (!results.poseLandmarks) {
//         detectionLostFrames++;
//         if (detectionLostFrames > 30) {
//           holdFrames = 0;
//           evaluationFrames = 0;
//           poseActive = false;
//         }
//         return;
//       }

//       detectionLostFrames = 0;
//       const lm = results.poseLandmarks;

//       // ---------- LANDMARKS ----------
//       const rHip = [lm[24].x, lm[24].y];
//       const rKnee = [lm[26].x, lm[26].y];
//       const rAnkle = [lm[28].x, lm[28].y];

//       const lHip = [lm[23].x, lm[23].y];
//       const lKnee = [lm[25].x, lm[25].y];
//       const lAnkle = [lm[27].x, lm[27].y];

//       const shoulderMid = [
//         (lm[11].x + lm[12].x) / 2,
//         (lm[11].y + lm[12].y) / 2,
//       ];

//       const nose = [lm[0].x, lm[0].y];

//       // ---------- DETECT STANDING LEG ----------
//       const rightIsStanding = rAnkle[1] > lAnkle[1];

//       let standHip, standKnee, standAnkle;
//       let liftHip, liftKnee, liftAnkle;

//       if (rightIsStanding) {
//         standHip = rHip;
//         standKnee = rKnee;
//         standAnkle = rAnkle;
//         liftHip = lHip;
//         liftKnee = lKnee;
//         liftAnkle = lAnkle;
//       } else {
//         standHip = lHip;
//         standKnee = lKnee;
//         standAnkle = lAnkle;
//         liftHip = rHip;
//         liftKnee = rKnee;
//         liftAnkle = rAnkle;
//       }

//       // ---------- ANGLES ----------
//       const standingLegAngle = calculate_angle(standHip, standKnee, standAnkle);
//       const liftedLegAngle = calculate_angle(liftHip, liftKnee, liftAnkle);

//       // ---------- BALANCE ----------
//       const bodyLean = Math.abs(nose[0] - shoulderMid[0]);

//       // ---------- FOOT HEIGHT ----------
//       const footLiftHeight = standAnkle[1] - liftAnkle[1];

//       // ---------- TREE DETECTION ----------
//       const treeDetected = footLiftHeight > 0.1;

//       let postureFeedback = [];

//       // ================= FORM CHECKS =================
//       if (standingLegAngle < 165)
//         postureFeedback.push("Keep your standing leg straight");

//       if (liftedLegAngle > 120)
//         postureFeedback.push("Lift your foot higher on leg");

//       if (bodyLean > 0.05) postureFeedback.push("Keep your body upright");

//       if (footLiftHeight < 0.12)
//         postureFeedback.push("Raise your foot above ankle");

//       // ================= HOLD DETECTION =================
//       if (treeDetected) {
//         holdFrames++;
//         poseActive = true;
//       } else {
//         poseActive = false;
//         holdFrames = 0;
//         evaluationFrames = 0;
//         lastSpokenMessage = "";
//       }

//       // ================= 5 SECOND COACH (FIXED) =================
//       // ================= SMART COACH (FIXED) =================
//       if (poseActive && holdFrames > 30 && !isSpeaking) {
//         // ----- PRIORITY: ERRORS FIRST -----
//         if (postureFeedback.length > 0) {
//           cleanFrames = 0; // reset perfect posture counter

//           evaluationFrames++;

//           if (evaluationFrames >= EVALUATION_TIME) {
//             evaluationFrames = 0;

//             // speak ONLY the most important correction
//             speak(postureFeedback[0]);
//           }
//         }

//         // ----- PERFECT POSTURE -----
//         else {
//           cleanFrames++;

//           // must be correct continuously (prevents flicker praise)
//           if (cleanFrames > CLEAN_THRESHOLD) {
//             evaluationFrames++;

//             if (evaluationFrames >= EVALUATION_TIME) {
//               evaluationFrames = 0;
//               speak("Good, now breathe slowly");
//             }
//           }
//         }
//       }

//       // ================= COUNTDOWN TIMER =================
//       let countdown = Math.ceil((EVALUATION_TIME - evaluationFrames) / 30);
//       if (countdown < 0) countdown = 0;

//       // ================= DRAW =================
//       drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
//         color: "#00FF00",
//         lineWidth: 4,
//       });
//       drawLandmarks(ctx, results.poseLandmarks, {
//         color: "#FF0000",
//         lineWidth: 2,
//       });

//       ctx.font = "26px Arial";

//       if (poseActive) {
//         ctx.fillStyle = "blue";
//         ctx.fillText(`Next feedback in: ${countdown}s`, 30, 50);

//         ctx.fillStyle = "green";
//         ctx.fillText(`Hold time: ${(holdFrames / 30).toFixed(1)}s`, 30, 90);
//       } else {
//         postureFeedback.forEach((msg, i) => {
//           ctx.fillStyle = "red";
//           ctx.fillText(msg, 30, 50 + i * 40);
//         });
//       }
//     });

//     await pose.initialize();

//     async function loop() {
//       await pose.send({ image: video });
//       requestAnimationFrame(loop);
//     }
//     loop();
//   } catch (e) {
//     status.textContent = "Camera error: " + e.message;
//   }
// }

// // START BUTTON
// document.getElementById("startBtn").addEventListener("click", async () => {
//   unlockSpeech();
//   await speechSynthesis.resume();
//   startLiveFeedback();
// });


// ================= STATE =================
let holdFrames = 0;
let poseActive = false;
let detectionLostFrames = 0;

// posture stability
let cleanFrames = 0;
const PRAISE_DELAY = 120; // 4 seconds @30fps

// ================= SPEECH QUEUE SYSTEM =================
let speechUnlocked = false;
let speaking = false;
let speechQueue = [];
let lastSpokenMessage = "";

// unlock speech
function unlockSpeech(){
    if(speechUnlocked) return;
    const u = new SpeechSynthesisUtterance("start");
    u.volume = 0;
    speechSynthesis.speak(u);
    speechSynthesis.resume();
    speechUnlocked = true;
}

// ---------- QUEUE SPEECH ----------
function queueSpeech(message, priority=false){

    if(!message) return;

    // prevent spam duplicates
    if(speechQueue.includes(message) || message===lastSpokenMessage)
        return;

    if(priority){
        speechQueue.unshift(message); // errors go first
    }else{
        speechQueue.push(message);
    }

    processSpeechQueue();
}

// ---------- SPEECH PROCESSOR ----------
function processSpeechQueue(){

    if(speaking) return;
    if(speechQueue.length===0) return;

    speaking = true;

    const message = speechQueue.shift();
    lastSpokenMessage = message;

    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(message);
    utter.rate = 1.12;
    utter.pitch = 1;
    utter.volume = 1;

    utter.onend = ()=>{
        speaking = false;
        processSpeechQueue(); // speak next automatically
    };

    utter.onerror = ()=>{
        speaking = false;
        processSpeechQueue();
    };

    speechSynthesis.speak(utter);
}

// keep Chrome speech alive
setInterval(()=>speechSynthesis.resume(),4000);

// ================= MATH =================
function calculate_angle(a,b,c){
    const radians =
        Math.atan2(c[1]-b[1],c[0]-b[0])-
        Math.atan2(a[1]-b[1],a[0]-b[0]);

    let angle=Math.abs(radians*180/Math.PI);
    return angle>180?360-angle:angle;
}

// ================= MAIN =================
async function startLiveFeedback(){

    const video=document.getElementById("video");
    const canvas=document.getElementById("canvas");
    const ctx=canvas.getContext("2d");
    const status=document.getElementById("status");

    try{

        const stream=await navigator.mediaDevices.getUserMedia({video:true});
        video.srcObject=stream;
        await new Promise(r=>video.onloadedmetadata=r);

        canvas.width=video.videoWidth;
        canvas.height=video.videoHeight;

        status.textContent="Stand sideways and perform Vrikshasana (Tree Pose).";

        const pose=new Pose({
            locateFile:(f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`
        });

        pose.setOptions({
            modelComplexity:1,
            smoothLandmarks:true,
            minDetectionConfidence:0.6,
            minTrackingConfidence:0.6
        });

        pose.onResults(results=>{

            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(video,0,0,canvas.width,canvas.height);

            if(!results.poseLandmarks){
                detectionLostFrames++;
                if(detectionLostFrames>30){
                    holdFrames=0;
                    poseActive=false;
                    cleanFrames=0;
                }
                return;
            }

            detectionLostFrames=0;
            const lm=results.poseLandmarks;

            // ---------- LANDMARKS ----------
            const rHip=[lm[24].x,lm[24].y];
            const rKnee=[lm[26].x,lm[26].y];
            const rAnkle=[lm[28].x,lm[28].y];

            const lHip=[lm[23].x,lm[23].y];
            const lKnee=[lm[25].x,lm[25].y];
            const lAnkle=[lm[27].x,lm[27].y];

            const shoulderMid=[(lm[11].x+lm[12].x)/2,(lm[11].y+lm[12].y)/2];
            const nose=[lm[0].x,lm[0].y];

            // standing leg detection
            const rightIsStanding = rAnkle[1] > lAnkle[1];

            let standHip,standKnee,standAnkle,liftHip,liftKnee,liftAnkle;

            if(rightIsStanding){
                standHip=rHip; standKnee=rKnee; standAnkle=rAnkle;
                liftHip=lHip; liftKnee=lKnee; liftAnkle=lAnkle;
            }else{
                standHip=lHip; standKnee=lKnee; standAnkle=lAnkle;
                liftHip=rHip; liftKnee=rKnee; liftAnkle=rAnkle;
            }

            // angles
            const standingLegAngle=calculate_angle(standHip,standKnee,standAnkle);
            const liftedLegAngle=calculate_angle(liftHip,liftKnee,liftAnkle);

            const bodyLean=Math.abs(nose[0]-shoulderMid[0]);
            const footLiftHeight=standAnkle[1]-liftAnkle[1];

            const treeDetected=footLiftHeight>0.10;

            let postureFeedback=[];

            if(standingLegAngle<165)
                postureFeedback.push("Keep your standing leg straight");

            if(liftedLegAngle>120)
                postureFeedback.push("Lift your foot higher on your leg");

            if(bodyLean>0.05)
                postureFeedback.push("Keep your body upright");

            if(footLiftHeight<0.12)
                postureFeedback.push("Raise your foot above your ankle");

            // ================= HOLD DETECTION =================
            if(treeDetected){
                holdFrames++;
                poseActive=true;
            }else{
                poseActive=false;
                holdFrames=0;
                cleanFrames=0;
            }

            // ================= COACHING =================
            if(poseActive){

                // ERROR PRIORITY
                if(postureFeedback.length>0){
                    cleanFrames=0;

                    // speak first error immediately
                    queueSpeech(postureFeedback[0],true);
                }

                // PRAISE ONLY AFTER STABILITY
                else{
                    cleanFrames++;

                    if(cleanFrames===PRAISE_DELAY){
                        queueSpeech("Good posture. ");
                    }
                }
            }

            // ================= DRAW =================
            drawConnectors(ctx,results.poseLandmarks,POSE_CONNECTIONS,{color:"#00FF00",lineWidth:4});
            drawLandmarks(ctx,results.poseLandmarks,{color:"#FF0000",lineWidth:2});

            ctx.font="26px Arial";

            if(poseActive){
                ctx.fillStyle="green";
                ctx.fillText(`Hold time: ${(holdFrames/30).toFixed(1)}s`,30,60);
            }else{
                postureFeedback.forEach((msg,i)=>{
                    ctx.fillStyle="red";
                    ctx.fillText(msg,30,50+i*40);
                });
            }
        });

        await pose.initialize();

        async function loop(){
            await pose.send({image:video});
            requestAnimationFrame(loop);
        }
        loop();

    }catch(e){
        status.textContent="Camera error: "+e.message;
    }
}

// START
document.getElementById("startBtn").addEventListener("click",()=>{
    unlockSpeech();
    startLiveFeedback();
});