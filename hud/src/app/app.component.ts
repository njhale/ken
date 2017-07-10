import { Component, OnInit, ElementRef } from '@angular/core';
import { CameraSource } from './camera.source';

import { Whereabout } from './models/whereabout';
import { WhereaboutService } from './services/whereabout.service';
import { SpacialService } from './services/spacial.service';


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
  wb: Whereabout;


  whereabouts: Map<string, Whereabout>;
  whereaboutskeys: string[];

  private name: string;
  private cameraSource: CameraSource;
  private direction: number;
  private maxAge: number = 10000;// milliseconds -> 10 seconds


  constructor(ref: ElementRef,
    private whereaboutService: WhereaboutService,
    private spacialService: SpacialService) {
    // Initialize the whereabout map
    this.whereabouts = new Map<string, Whereabout>();
    this.elem = ref.nativeElement;
    this.cameraSource = new CameraSource();

    // Connect to the socket
    this.whereaboutService.socketConnect();

    this.name = `nick-${Math.random() * 1000 + 1}`;

    // Get the lat and long every second
    setInterval(() => {
      let lat = 0;
      let lon = 0;

      navigator.geolocation.getCurrentPosition((position) => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      });

      // Send the data through the socket
      this.wb = {
        name: this.name,
        position: [lat, lon, 0],
        tm: new Date()
      };

      this.whereaboutService.socket.emit('whereabouts', this.wb);

    }, 1000);

    // Delete all whereabouts older than 10 seconds
    setInterval(() => {

      // Get current time
      let tm = new Date();

      // Iterate through each key-value pair
      this.whereabouts.forEach((wb, key, map) => {
        if (tm.getTime() - this.wb.tm.getTime() > this.maxAge) {
          // Older than the max age for any info. Scrub it from the map.
          this.whereabouts.delete(key);
          this.whereaboutskeys = Array.from(this.whereabouts.keys());
        }
      });

    }, this.maxAge);

    // Set the event listener for compass degrees
    window.addEventListener('deviceorientation', (eventData) => {
      // alpha is the compass direction the device is facing in degrees
      var dir = eventData.alpha;
      // console.log(`compass: ${dir}`);
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
      callback: () => { }
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
        console.log(device.kind, ": ", device.label, " id = ", device.deviceId);
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
      if (wb.name !== this.name) {
        this.whereabouts.set(wb.name, wb);
        this.whereaboutskeys = Array.from(this.whereabouts.keys());
        console.log(`Receiving data for ${wb.name}`);
        // try {
        //   // attempt to set the position attribute
        //   var billboard = document.getElementById(wb.name);
        //   billboard.setAttribute('position', this.mapPosition(wb));
        // } catch (ex) {
        //   console.log(ex);
        // }

        // console.log('wb stored!');
      }

      // if(thispac.pkgId && thispac.position.length > 0){
      //   this.updateLocation(thispac.pkgId, thispac.position, thispac.time);
      // }
    });

  }

  mapPosition(wb: Whereabout): any {

    console.log(`Whereabouts: ${wb.position} - ${this.wb.position}`);
    // Get the distance in meters between both points
    let r = this.spacialService.distance(this.wb, wb);
    // Get the angle in radians between both points
    let theta = this.spacialService.angle(this.wb, wb);
    // Calculate the cartesian coordinates from the given polar coords
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);

    //console.log(`*ngFor called! mapPosition: (x, y) => (${x}, ${y})`);

    return {
      "x": x,
      "y": "1",
      "z": y
    }

  }

  long2UTM(long: number): number {
    return (Math.floor((long + 180) / 6) % 60) + 1;
  }

}
