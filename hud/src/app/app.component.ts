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

  private name: string;
  private cameraSource: CameraSource;
  private direction: number;
  private dirCount: number;
  private maxAge: number = 5000;// milliseconds -> 5 seconds


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

    // Instantiate the whereabout
    this.wb = new Whereabout();
    this.wb.name = this.name;
    this.wb.position = [0, 0, 0];
    this.wb.tm = new Date();
    this.direction = -1;
    this.dirCount = 0;
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
    this.aframe = this.elem.querySelector('a-scene');
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      var id;
      console.log('In promise');
      devices.forEach(function(device) {
        // console.log(device.kind, ": ", device.label, " id = ", device.deviceId);
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
    //let count = 0;
    // Set the event listener for compass degrees
    window.addEventListener('deviceorientationabsolute', (eventData: DeviceOrientationEvent) => {
      // alpha is the compass direction the device is facing in degrees
      let alpha = eventData.alpha;
      let beta = eventData.beta;
      let gamma = eventData.gamma;
      // Get the true direction using all rotational info
      let dir = this.spacialService.compassHeading(alpha, beta, gamma);

      console.log(`Bearing off north: ${dir}`);
      // console.log(`compass: ${dir}`);
      // Set the direction in degrees
      if (this.direction < 0) {

        // Correct the direction to match the right handed system
        this.direction = this.spacialService.toCounterClockwise(dir);

        console.log(`Compass Heading Correction: ${dir} -> ${this.direction}`);
        //let correction = 360 - this.direction;
        // Grab the board element and rotate it
        // let board = document.getElementById('board');
        // board.setAttribute('rotation', `0 ${correction} 0`);
      }
    }, false);

    // Get the lat and long every second
    setInterval(() => {
      // Get the geo coords and once done emit to the socket
      navigator.geolocation.getCurrentPosition((position) => {
        this.wb.position[0] = position.coords.latitude;
        this.wb.position[1] = position.coords.longitude;
        //console.log(`position: ${this.wb.position}`);
        this.wb.tm = new Date();
        this.whereaboutService.socket.emit('whereabouts', this.wb);
      });
    }, 250);

    this.connection = this.whereaboutService.getMessages().subscribe((message) => {
      let wb = message as Whereabout;
      wb.tm = new Date(message["tm"]);
      console.log(`This is the wb: ${wb}`);
      if (wb.name !== this.name) {
        this.whereabouts.set(wb.name, wb);
        //console.log(`Receiving data for ${wb.name} - whereabouts ${wb.position}`);
        try {
          // Attempt to set the position attribute
          var billboard = document.getElementById(wb.name);

          if (billboard === null) {
            // Get the parent element
            var scene = document.getElementById('board');
            // Create the billboard
            // <a-entity look-at=[camera] *ngFor="let key of whereaboutskeys" id="{{key}}" position="1 0 1">
            //   <!-- Label a plane, three times. -->
            //   <a-plane width="1" depth="1"
            //     text="baseline: center; align: center; font: kelsonsans; color: black; value: Grooserton">
            //     <a-image src='#groose'></a-image>
            //   </a-plane>
            // </a-entity>
            billboard = document.createElement('a-entity');
            billboard.id = wb.name;
            billboard.setAttribute('look-at', '[camera]');
            // Create a plane for the user image to sit in
            let plane = document.createElement('a-plane');
            plane.id = `${wb.name}-plane`;
            plane.setAttribute('width', '1');
            plane.setAttribute('depth', '1');
            // Create the image
            let image = document.createElement('a-image');
            image.id = `${wb.name}-image`;
            image.setAttribute('src', '#groose');
            // Append the image to the plane
            plane.appendChild(image);
            // Append the plane to the billboard
            billboard.appendChild(plane);
            // Append the billboard to the scene
            scene.appendChild(billboard);
          }
          // Set the text
          let plane = document.getElementById(`${wb.name}-plane`);
          let r = this.spacialService.distance(this.wb, wb);
          plane.setAttribute('text', `baseline: center; align: center;
            font: kelsonsans; color: red; value: ${r}m`);
          // // Set the image if warranted
          // if (r > 50) {
          //   let image = document.getElementById(`${wb.name}-image`);
          //   image.setAttribute('src', '#target');
          // }
          // Set the position
          billboard.setAttribute('position', this.mapPosition(wb));

        } catch (ex) {
          console.log(ex);
        }

        // console.log('wb stored!');
      }

    });

    // Delete all whereabouts older than 10 seconds
    setInterval(() => {
      let tm = new Date();
      try {
        // Iterate through each key-value pair
        this.whereabouts.forEach((wb, key, map) => {
          console.log(`wb.tm: ${wb.tm}`);
          if (tm.getTime() - wb.tm.getTime() > this.maxAge) {
            // Older than the max age for any info. Scrub it from the map.
            this.whereabouts.delete(key);
            // Get the a-entity to delete
            var entity = document.getElementById(wb.name);
            // Get the a-entity's parent
            var parent = entity.parentElement;
            // Remove the child element
            parent.removeChild(entity);

            console.log(`${wb.name} deleted!`);
          }
        });
      } catch(ex) {
        console.log(ex);
      }

    }, this.maxAge);

  }

  mapPosition(wb: Whereabout): any {

    // Get the distance in meters between both points
    let r = this.spacialService.distance(this.wb, wb);
    // Get the angle in radians between both points
    let theta = this.spacialService.azimuth(this.wb, wb);
    // // Correct for direction off of north
    // if (this.direction > 0) {
    //   // Correct the direction to match the mapped polar coords
    //   let corDir = (-1 * this.direction - 90) % 360;
    //   theta = this.spacialService.toDegrees(theta) + corDir;
    //   theta = this.spacialService.toRadians(theta);
    // }

    // if (r > 200) {
    //   r = r / 10;
    // }
    //
    if (r > 100) {
      r = 1;
    }

    // Adjust theta if we have heading info to align coordinates with north
    if (this.direction >= 0) {
      //let correction = 360 - this.direction;
      let thetaDegrees = this.spacialService.toDegrees(theta);
      let corrected = 360 - thetaDegrees - this.direction;
      if (corrected > 0) {
        theta = this.spacialService.toRadians(corrected);
      } else {
        theta = this.spacialService.toRadians(360 - corrected);
      }

    }

    // Calculate the cartesian coordinates from the given polar coords
    let x = r * Math.cos(theta);
    let z = r * Math.sin(theta);

    console.log(`mapPosition: (x, y) => (${x}, ${z}) r = ${r} theta: ${theta} direction: ${this.direction}`);

    return {
      "x": x,
      "y": "1.6",
      "z": z
    }

  }

}
