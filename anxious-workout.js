// ================= COBRA STATE =================
// let holdFrames = 0;
// let poseActive = false;
// let detectionLostFrames = 0;

// // ----- COACH TIMER -----
// let evaluationFrames = 0;
// const EVALUATION_TIME = 150; // 5 seconds (30fps)

// // prevent repeating same message forever
// let lastSpokenMessage = "";

// // ================= SPEECH =================
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

//     speechSynthesis.cancel();   // CRITICAL: stop overlapping speech

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

//         status.textContent="Turn sideways and perform Bhujangasana.";

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
//             const elbow=[lm[14].x,lm[14].y];
//             const wrist=[lm[16].x,lm[16].y];
//             const hip=[lm[24].x,lm[24].y];

//             // HEAD (ears midpoint)
//             const head=[
//                 (lm[7].x+lm[8].x)/2,
//                 (lm[7].y+lm[8].y)/2
//             ];

//             // ---------- GEOMETRY ----------
//             const elbowAngle=calculate_angle(shoulder,elbow,wrist);
//             const torsoLift=hip[1]-shoulder[1];
//             const backBend=hip[0]-shoulder[0];
//             const handOffset=Math.abs(wrist[0]-shoulder[0]);

//             // Cobra detection (prevents plank)
//             const cobraDetected = torsoLift>0.09 && backBend>0.035;

//             let postureFeedback=[];

//             // ================= FORM CHECKS =================

//             if(!(torsoLift>0.14 && backBend>0.065))
//                 postureFeedback.push("Press your palms and open your chest");

//             if(elbowAngle<165)
//                 postureFeedback.push("Straighten your arms");

//             if(handOffset>0.065)
//                 postureFeedback.push("Place palms under shoulders");

//             // if(head[1]<shoulder[1]-0.11)
//             //     postureFeedback.push("Keep your neck neutral");

//             // ================= HOLD DETECTION =================
//             if(cobraDetected){
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

//                     evaluationFrames=1; // restart cycle

//                     let message;

//                     if(postureFeedback.length===0){
//                         message="Good posture. Keep breathing slowly";
//                     }else{
//                         message=postureFeedback[0]; // only most important correction
//                     }

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

// // START BUTTON
// document.getElementById("startBtn").addEventListener("click",()=>{
//     unlockSpeech();
//     speechSynthesis.resume();   // VERY IMPORTANT FOR CHROME
//     startLiveFeedback();
// });



// ================= STATE =================
let holdFrames = 0;
let poseActive = false;
let detectionLostFrames = 0;

// stability tracking
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
        speechQueue.unshift(message); // errors interrupt praise
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

        status.textContent="Turn sideways and perform Bhujangasana.";

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
            const elbow=[lm[14].x,lm[14].y];
            const wrist=[lm[16].x,lm[16].y];
            const hip=[lm[24].x,lm[24].y];

            const head=[
                (lm[7].x+lm[8].x)/2,
                (lm[7].y+lm[8].y)/2
            ];

            // ---------- GEOMETRY ----------
            const elbowAngle=calculate_angle(shoulder,elbow,wrist);
            const torsoLift=hip[1]-shoulder[1];
            const backBend=hip[0]-shoulder[0];
            const handOffset=Math.abs(wrist[0]-shoulder[0]);

            const cobraDetected = torsoLift>0.09 && backBend>0.035;

            let postureFeedback=[];

            // ================= FORM CHECKS =================

            if(!(torsoLift>0.14 && backBend>0.065))
                postureFeedback.push("Press your palms and open your chest");

            if(elbowAngle<165)
                postureFeedback.push("Straighten your arms");

            if(handOffset>0.065)
                postureFeedback.push("Place palms under shoulders");
            const leftAnkle  = [lm[27].x, lm[27].y];
            const rightAnkle = [lm[28].x, lm[28].y];

            const floorY = (leftAnkle[1] + rightAnkle[1]) / 2;
            const hipToFloor = Math.abs(hip[1] - floorY);

            if(hipToFloor > 0.18)
                postureFeedback.push("Lower your hips toward the floor");

            // ================= HOLD DETECTION =================
            if(cobraDetected){
                holdFrames++;
                poseActive=true;
            }else{
                poseActive=false;
                holdFrames=0;
                cleanFrames=0;
            }

            // ================= COACHING SYSTEM =================
            if(poseActive){

                // ERRORS FIRST
                if(postureFeedback.length>0){
                    cleanFrames=0;
                    queueSpeech(postureFeedback[0],true);
                }

                // PRAISE ONLY AFTER STABILITY
                else{
                    cleanFrames++;

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