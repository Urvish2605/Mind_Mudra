// // ================= UTTANASANA STATE =================
// let holdFrames = 0;
// let poseActive = false;
// let detectionLostFrames = 0;

// // ----- COACH TIMER -----
// let evaluationFrames = 0;
// const EVALUATION_TIME = 150; // 5 seconds

// let lastSpokenMessage = "";

// // ================= SPEECH (UNCHANGED) =================
// let speechUnlocked = false;
// let isSpeaking = false;

// function unlockSpeech(){
//     if(speechUnlocked) return;
//     speechSynthesis.cancel();
//     speechSynthesis.speak(new SpeechSynthesisUtterance(" "));
//     speechUnlocked = true;
// }

// function speak(message){
//     if(!message) return;
//     if(message === lastSpokenMessage) return;

//     lastSpokenMessage = message;

//     speechSynthesis.cancel();

//     const utter = new SpeechSynthesisUtterance(message);
//     utter.rate = 1;
//     utter.pitch = 1;
//     utter.volume = 1;

//     isSpeaking = true;
//     utter.onend = ()=> isSpeaking = false;

//     speechSynthesis.speak(utter);
// }

// // ================= MATH =================
// function calculate_angle(a,b,c){
//     const radians =
//         Math.atan2(c[1]-b[1],c[0]-b[0])-
//         Math.atan2(a[1]-b[1],a[0]-b[0]);

//     let angle=Math.abs(radians*180/Math.PI);
//     return angle>180?360-angle:angle;
// }

// // ================= MAIN =================
// async function startLiveFeedback(){

//     const video=document.getElementById("video");
//     const canvas=document.getElementById("canvas");
//     const ctx=canvas.getContext("2d");
//     const status=document.getElementById("status");

//     try{

//         const stream=await navigator.mediaDevices.getUserMedia({video:true});
//         video.srcObject=stream;
//         await new Promise(r=>video.onloadedmetadata=r);

//         canvas.width=video.videoWidth;
//         canvas.height=video.videoHeight;

//         status.textContent="Stand sideways and perform Uttanasana (Forward Bend).";

//         const pose=new Pose({
//             locateFile:(f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`
//         });

//         pose.setOptions({
//             modelComplexity:1,
//             smoothLandmarks:true,
//             minDetectionConfidence:0.6,
//             minTrackingConfidence:0.6
//         });

//         pose.onResults(results=>{

//             ctx.clearRect(0,0,canvas.width,canvas.height);
//             ctx.drawImage(video,0,0,canvas.width,canvas.height);

//             if(!results.poseLandmarks){
//                 detectionLostFrames++;
//                 if(detectionLostFrames>30){
//                     holdFrames=0;
//                     evaluationFrames=0;
//                     poseActive=false;
//                 }
//                 return;
//             }

//             detectionLostFrames=0;
//             const lm=results.poseLandmarks;

//             // ---------- LANDMARKS ----------
//             const shoulder=[lm[12].x,lm[12].y];
//             const hip=[lm[24].x,lm[24].y];
//             const knee=[lm[26].x,lm[26].y];
//             const ankle=[lm[28].x,lm[28].y];
//             const nose=[lm[0].x,lm[0].y];

//             // ---------- ANGLES ----------
//             const hipAngle = calculate_angle(shoulder,hip,knee);
//             const kneeAngle = calculate_angle(hip,knee,ankle);

//             // ---------- FORWARD FOLD DETECTION ----------
//             const torsoDrop = shoulder[1] - hip[1];   // shoulder below hip?
//             const headDrop  = nose[1] - shoulder[1];  // head hanging?

//             const forwardBendDetected = torsoDrop > 0.08;

//             let postureFeedback=[];

//             // ================= FORM CHECKS =================

//             // insufficient bend
//             if(hipAngle > 120)
//                 postureFeedback.push("Bend forward more from your hips");

//             // knees bent (squat cheating)
//             if(kneeAngle < 160)
//                 postureFeedback.push("Keep your legs straight");

//             // head not relaxed
//             if(headDrop < 0.03)
//                 postureFeedback.push("Relax your neck and let your head hang");

//             // bending from back instead of hips
//             if(torsoDrop < 0.10)
//                 postureFeedback.push("Fold from the hips, not your back");

//             // ================= HOLD DETECTION =================
//             if(forwardBendDetected){
//                 holdFrames++;
//                 poseActive=true;
//             }else{
//                 poseActive=false;
//                 holdFrames=0;
//                 evaluationFrames=0;
//                 lastSpokenMessage="";
//             }

//             // ================= 5 SECOND COACH =================
//             if(poseActive && holdFrames>30){

//                 evaluationFrames++;

//                 if(evaluationFrames>=EVALUATION_TIME){

//                     evaluationFrames=1;

//                     let message;

//                     if(postureFeedback.length===0)
//                         message="Good, now breathe slowly";
//                     else
//                         message=postureFeedback[0];

//                     speak(message);
//                 }
//             }

//             // ================= COUNTDOWN TIMER =================
//             let countdown=Math.ceil((EVALUATION_TIME-evaluationFrames)/30);
//             if(countdown<0) countdown=0;

//             // ================= DRAW =================
//             drawConnectors(ctx,results.poseLandmarks,POSE_CONNECTIONS,{color:"#00FF00",lineWidth:4});
//             drawLandmarks(ctx,results.poseLandmarks,{color:"#FF0000",lineWidth:2});

//             ctx.font="26px Arial";

//             if(poseActive){
//                 ctx.fillStyle="blue";
//                 ctx.fillText(`Next feedback in: ${countdown}s`,30,50);

//                 ctx.fillStyle="green";
//                 ctx.fillText(`Hold time: ${(holdFrames/30).toFixed(1)}s`,30,90);
//             }else{
//                 postureFeedback.forEach((msg,i)=>{
//                     ctx.fillStyle="red";
//                     ctx.fillText(msg,30,50+i*40);
//                 });
//             }

//         });

//         await pose.initialize();

//         async function loop(){
//             await pose.send({image:video});
//             requestAnimationFrame(loop);
//         }
//         loop();

//     }catch(e){
//         status.textContent="Camera error: "+e.message;
//     }
// }

// // START BUTTON (UNCHANGED)
// document.getElementById("startBtn").addEventListener("click",()=>{
//     unlockSpeech();
//     speechSynthesis.resume();
//     startLiveFeedback();
// });


// ================= STATE =================
let holdFrames = 0;
let poseActive = false;
let detectionLostFrames = 0;

// posture stability
let cleanFrames = 0;
const PRAISE_DELAY = 120; // 4 seconds stable posture

// ================= SPEECH QUEUE SYSTEM =================
let speechUnlocked = false;
let speaking = false;
let speechQueue = [];
let lastSpokenMessage = "";

// unlock speech (Chrome + iOS fix)
function unlockSpeech(){
    if(speechUnlocked) return;
    const u = new SpeechSynthesisUtterance("start");
    u.volume = 0;
    speechSynthesis.speak(u);
    speechSynthesis.resume();
    speechUnlocked = true;
}

// add message to queue
function queueSpeech(message, priority=false){

    if(!message) return;

    // prevent duplicate spam
    if(speechQueue.includes(message) || message===lastSpokenMessage)
        return;

    if(priority)
        speechQueue.unshift(message); // corrections interrupt praise
    else
        speechQueue.push(message);

    processSpeechQueue();
}

// speech processor
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
        processSpeechQueue();
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

        status.textContent="Stand sideways and perform Uttanasana (Forward Bend).";

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
            const shoulder=[lm[12].x,lm[12].y];
            const hip=[lm[24].x,lm[24].y];
            const knee=[lm[26].x,lm[26].y];
            const ankle=[lm[28].x,lm[28].y];
            const nose=[lm[0].x,lm[0].y];

            // ---------- ANGLES ----------
            const hipAngle = calculate_angle(shoulder,hip,knee);
            const kneeAngle = calculate_angle(hip,knee,ankle);

            // ---------- FORWARD FOLD DETECTION ----------
            const torsoDrop = shoulder[1] - hip[1];
            const headDrop  = nose[1] - shoulder[1];

            const forwardBendDetected = torsoDrop > 0.08;

            let postureFeedback=[];

            // ================= FORM CHECKS =================

            if(hipAngle > 120)
                postureFeedback.push("Bend forward more from your hips");

            if(kneeAngle < 160)
                postureFeedback.push("Keep your legs straight");

            if(headDrop < 0.03)
                postureFeedback.push("Relax your neck and let your head hang");

            if(torsoDrop < 0.10)
                postureFeedback.push("Fold from your hips not your back");

            // ================= HOLD DETECTION =================
            if(forwardBendDetected){
                holdFrames++;
                poseActive=true;
            }else{
                poseActive=false;
                holdFrames=0;
                cleanFrames=0;
            }

            // ================= COACHING (NEW SYSTEM) =================
            if(poseActive){

                // errors always priority
                if(postureFeedback.length>0){
                    cleanFrames=0;
                    queueSpeech(postureFeedback[0], true);
                }
                else{
                    cleanFrames++;

                    // praise only after stable posture
                    if(cleanFrames===PRAISE_DELAY){
                        queueSpeech("Good posture. Breathe slowly.");
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

// START BUTTON
document.getElementById("startBtn").addEventListener("click",()=>{
    unlockSpeech();
    startLiveFeedback();
});