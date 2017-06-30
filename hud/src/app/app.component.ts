import { Component, OnInit, ElementRef } from '@angular/core';
import { CameraSource } from './camera.source';

import { Whereabout } from './models/whereabout';
import { WhereaboutService } from './services/whereabout.service';

import * as proj4 from "proj4";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit {
  elem: any;
  aframe: any;
  timeout: any;
  connection: any;
  lat: number;
  lon: number;
  private name: string;
  private whereabouts: WhereaboutMap = {};
  private cameraSource: CameraSource;


  constructor(ref: ElementRef,
    private whereaboutService: WhereaboutService) {
    console.log('here we are!');
    this.elem = ref.nativeElement;
    this.cameraSource = new CameraSource();

    // Connect to the socket
    this.whereaboutService.socketConnect();

    this.name = `nick-${Math.random()*1000 + 1}`;

    // Get the lat and long every second
    setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;
      });

      // Send the data through the socket
      let wb: Whereabout = {
        name: this.name,
        position: [this.lat, this.lon, 0],
        tm: new Date()
      };

      this.whereaboutService.socket.emit('whereabouts', wb);

    }, 1000);
  }

  startCamera(id: any) {
    var vid = document.querySelector('#inputVideo');

    this.cameraSource.start({
      videoElement: vid,
      constraints: {
        video: { deviceId: id ? { exact: id } : undefined }
      },
      callback: function() {

      }
    });

   }

  ngOnInit() {
    console.log('This is ng init!');

    this.aframe = this.elem.querySelector('a-scene');
    console.log('Got the f-ing aframe')
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      var id;
      console.log('In promise');
      devices.forEach(function(device) {
        console.log(device.kind, ": ",  device.label, " id = ",  device.deviceId);
        if (device.kind === 'videoinput') {
          id = device.deviceId;
        }
      });
      this.startCamera(id);
    }).catch(function(err) {
      console.log(err.name, ": ", err.message);
    });

    // Initialize the incoming whereabouts
    this.initializeData();
  }

  initializeData(): void {

    this.connection = this.whereaboutService.getMessages().subscribe((message) => {
      let wb = message as Whereabout;
      console.log()
      if(wb.name !== this.name){
        this.whereabouts[wb.name] = wb;
        console.log('wb stored!');
      }
      // if(thispac.pkgId && thispac.position.length > 0){
      //   this.updateLocation(thispac.pkgId, thispac.position, thispac.time);
      // }
    });

  }

  mapPosition(wb: Whereabout) : string {
    let dLat = (wb.position[0] - this.lat) * 110.574;
    let dLon = (wb.position[1] - this.lon) * Math.cos(dLat);

    let pos = `${dLon*1000} 1 ${dLat*1000}`;
    console.log(`my pos: ${pos}`);
    return pos;
  }

  long2UTM(long: number) : number {
    return (Math.floor((long + 180)/6) % 60) + 1;
  }


  keys() : Array<any> {
    return Object.keys(this.whereabouts);
  }
}

interface WhereaboutMap {
  [name: string]: Whereabout
}
