

export class CameraSource {

  id: any;
  title: any;
  videoElement: any;
  constraints: any;

  constructor() {
    this.id = 'source-camera';
    this.title = 'Camera';
    this.videoElement = null;
    this.constraints = {
      video: true
    };
  }



  showCameraPreview(cb: any) {
    navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {

      if (this.videoElement) {
        this.videoElement.srcObject = stream;
        this.videoElement.play();
      }

      if (cb) {
        cb(stream);
      }

    }, function(err: any) { console.error(err); });
  }

  start(opts: any) {
    if (opts.constraints) {
      this.constraints = opts.constraints;
    }
    this.videoElement = opts.videoElement;
    this.showCameraPreview(opts.callback);
  }

}
