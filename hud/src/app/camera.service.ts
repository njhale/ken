declare var cameraSource;

cameraSource = (function(global) {

  var id = 'source-camera',
    title = 'Camera',
    videoElement = null,
    constraints = {
      video: true
    };

  function start(opts) {
    if (opts.constraints) {
      constraints = opts.constraints;
    }
    videoElement = opts.videoElement;
    showCameraPreview(opts.callback);
  }

  function showCameraPreview(cb) {
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
      }

      if (cb) {
        cb(stream);
      }

    }, function(err) { console.error(err); });
  }
})

export default cameraSource;
