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
  public whereabouts: WhereaboutMap = {};
  public posMap: PosMap = {};
  private cameraSource: CameraSource;
  private direction: number;


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

    window.addEventListener('deviceorientation', (eventData) => {
      // alpha is the compass direction the device is facing in degrees
      var dir = eventData.alpha;
      console.log(`compass: ${dir}`);
      // Set the direction in degrees
      this.direction = dir;
    }, false);
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
      if(wb.name != this.name){
        this.whereabouts[wb.name] = wb;
        try {
          // attempt to set the position attribute
          var billboard = document.getElementById(wb.name);
          billboard.setAttribute('position', this.mapPosition(wb));
        } catch (ex) {
          console.log(ex);
        }

        // console.log('wb stored!');
      }
      // if(thispac.pkgId && thispac.position.length > 0){
      //   this.updateLocation(thispac.pkgId, thispac.position, thispac.time);
      // }
    });

  }

  mapPosition(wb: Whereabout) : any {
    let myLat = this.lat * 110.574;
    let myLon = this.lon * Math.cos((myLat) * (Math.PI/180));
    let tLat = wb.position[0] * 110.574;
    let tLon = wb.position[1] * Math.cos((tLat) * (Math.PI/180));
    console.log(`tLat: ${tLat}`)

    let dLat = (tLat - myLat)*1000;
    let dLon = (tLon - myLon)*1000;
9
    return {
      "x": dLon,
      "y": "1",
      "z": dLat
    }
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

interface PosMap {
  [name: string]: string
}
