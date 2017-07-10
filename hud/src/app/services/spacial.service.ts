import { Injectable } from '@angular/core';

import { Whereabout } from '../models/whereabout';

@Injectable()
export class SpacialService {

  // Radius of the Earth in meters
  private R: number = 6371e3;

  constructor() { }

  private toRadians(degrees: number) {
    if (degrees < 0) {
      // Add 360 to get it to the positive representation
      degrees += 360;
    }
    // % 360 to bound the angle
    degrees = degrees % 360;

    return (Math.PI / 180) * degrees;
  }

  private toDegrees(radians: number) {
    return (180 / Math.PI) * radians;
  }

  angle(from: Whereabout, to: Whereabout) : number {

    // Convert all lat and lon to radians
    let fromRads = from.position.map(this.toRadians);
    let toRads = to.position.map(this.toRadians);
    let diff = [];
    to.position.forEach((e, i, arr) => {
      diff.push(e - from.position[i]);
    });
    let diffRads = diff.map(this.toRadians);

    console.log(`angle()... fromRads: ${fromRads} toRads: ${toRads} diffRads: ${diffRads}`);

    let y = Math.sin(diffRads[1]) * Math.cos(toRads[0]);
    let x = Math.cos(fromRads[0]) * Math.sin(toRads[0]) - Math.sin(fromRads[0])
            * Math.cos(toRads[0]) * Math.cos(diffRads[1]);

    //console.log(`toDegrees: (x, y) => (${x}, ${y})`);

    let brng = Math.atan2(y, x);
    brng = this.toDegrees(brng);
    brng = (brng + 360) % 360;
    brng = 360 - brng; // count degrees counter-clockwise - remove to make clockwise
    // return to radians
    brng = this.toRadians(brng);

    return brng;
  }


  distance(from: Whereabout, to: Whereabout) : number {
    let d = 0;

    try {
      // Convert all lat and lon to radians
      let fromRads = from.position.map(this.toRadians);
      let toRads = to.position.map(this.toRadians);
      let diff = [];
      to.position.forEach((e, i, arr) => {
        diff.push(e - from.position[i]);
      });
      let diffRads = diff.map(this.toRadians);

      console.log(`distance()... fromRads: ${fromRads} toRads: ${toRads} diffRads: ${diffRads}`);

      // Use the haversine formula to calculate distance in meters
      let a = Math.sin(diffRads[0]/2) * Math.sin(diffRads[0]/2) +
          Math.cos(fromRads[0]) * Math.cos(toRads[0]) *
          Math.sin(diffRads[1]/2) * Math.sin(diffRads[1]/2);

      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      d = this.R * c;
    } catch(e) {
      console.log(`Something terrible has happened ${e}`);
    }

    return d;
  }
}
