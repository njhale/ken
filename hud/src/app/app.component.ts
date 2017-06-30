import { Component, OnInit, ElementRef } from '@angular/core';
import cameraSource from './camera.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit {
  elem: any;
  aframe: any;
  timeout: any;


  constructor(ref: ElementRef) {
    console.log('here we are!');
    this.elem = ref.nativeElement;
  }

  startCamera(id: any) {
    var vid = document.querySelector('#inputVideo');

    cameraSource.start({
      videoElement: vid,
      constraints: {
        video: { deviceId: id ? { exact: id } : undefined }
      },
      callback: function() {

      }
    })
   }

  ngOnInit() {
    console.log('This is ng init!');

    this.aframe = this.elem.querySelector('a-scene');
    navigator.mediaDevices.enumerateDevices().then(function(devices) {
      var id;
      devices.forEach(function(device) {
        //console.log(device.kind": "  device.label " id = "  device.deviceId);
        if (device.kind === 'videoinput') {
          id = device.deviceId;
        }
      });
      this.startCamera(id);
    }).catch(function(err) {
      console.log(err.name, ": ", err.message);
    });
  }
}
