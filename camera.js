const video = document.getElementById('webcam');
const camStatus = document.getElementById('cam-status');
let cameraStream = null;
async function startCamera(){
  try{
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio:false });
    video.srcObject = cameraStream;
    camStatus.textContent = "Camera: on";
  }catch(err){
    console.warn("Camera not available:", err);
    camStatus.textContent = "Camera: unavailable";
  }
}
function stopCamera(){
  if(cameraStream){ cameraStream.getTracks().forEach(t=>t.stop()); cameraStream = null; }
  video.srcObject = null;
  camStatus.textContent = "Camera: off";
}
window.addEventListener("DOMContentLoaded", ()=> { startCamera(); });
window.stopCamera = stopCamera;
