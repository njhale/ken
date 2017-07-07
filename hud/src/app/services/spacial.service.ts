import { Injectable } from '@angular/core';

import { Whereabout } from '../models/whereabout';

@Injectable()
export class SpacialService {

  // Radius of the Earth in meters
  private R: number = 6371e3;

  constructor() { }

  private toRadians(degrees: number) {
    return (Math.PI / 180) * degrees;
  }

  private toDegrees(radians: number) {
    return (180 / Math.PI) * radians;
  }

  angle(from: Whereabout, to: Whereabout) : number {

    // Convert all lat and lon to radians
    let fromRads = from.position.map(this.toRadians);
    let toRads = to.position.map(this.toRadians);
    let diffRads = to.position.forEach((e, i, arr) => {
      return e - from.position[i];
    });


    let y = Math.sin(diffRads[1]) * Math.cos(toRads[0]);
    let x = Math.cos(fromRads[0]) * Math.sin(toRads[0]) - Math.sin(fromRads[0])
            * Math.cos(toRads[0]) * Math.cos(diffRads[1]);

    console.log(`(x, y) => ($x, $y)`);

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
      let diffRads = to.position.forEach((e, i, arr) => {
        return e - from.position[i];
      });

      // Use the haversine formula to calculate distance in meters
      let a = Math.sin(diffRads[0]/2) * Math.sin(diffRads[0]/2) +
          Math.cos(fromRads[0]) * Math.cos(toRads[0]) *
          Math.sin(diffRads[1]/2) * Math.sin(diffRads[1]/2);

      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      d = this.R * c;
    } catch(e) {
      console.log(`Something terrible has happened $e`);
    }

    return d;
  }
}
