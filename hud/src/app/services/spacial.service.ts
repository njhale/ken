import { Injectable } from '@angular/core';

import { Whereabout } from '../models/whereabout';

@Injectable()
export class SpacialService {

  // Radius of the Earth in meters
  private R: number = 6371e3;

  constructor() { }

  toRadians(degrees: number) {
    // if (degrees < 0) {
    //   // Add 360 to get it to the positive representation
    //   degrees += 360;
    // }
    // % 360 to bound the angle
    degrees = degrees % 360;

    return (Math.PI / 180) * degrees;
  }

  toDegrees(radians: number) {
    return (180 / Math.PI) * radians;
  }

  toCounterClockwise(clockwise: number) {
    let h = 450 - clockwise;
    if (h > 360) {
      return h - 360;
    }
    return h;
  }

  compassHeading(alpha: number, beta: number, gamma: number): number {

    // Convert degrees to radians
    var alphaRad = alpha * (Math.PI / 180);
    var betaRad = beta * (Math.PI / 180);
    var gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var cB = Math.cos(betaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = - cA * sG - sA * sB * cG;
    var rB = - sA * sG + cA * sB * cG;
    var rC = - cB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;
  }

  azimuth(from: Whereabout, to: Whereabout): number {
    // Convert all lat and lon to radians
    let fromRads = from.position.map(this.toRadians);
    let toRads = to.position.map(this.toRadians);
    let diff = [];
    to.position.forEach((e, i, arr) => {
      diff.push(e - from.position[i]);
    });
    let diffRads = diff.map(this.toRadians);

    // var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    // var Δλ = (point.lon-this.lon).toRadians();
    //
    // // see http://mathforum.org/library/drmath/view/55417.html
    // var y = Math.sin(Δλ) * Math.cos(φ2);
    // var x = Math.cos(φ1)*Math.sin(φ2) -
    //         Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    // var θ = Math.atan2(y, x);

    //console.log(`angle()... fromRads: ${fromRads} toRads: ${toRads} diffRads: ${diffRads}`);

    let y = Math.sin(diffRads[1]) * Math.cos(toRads[0]);
    let x = Math.cos(fromRads[0]) * Math.sin(toRads[0]) - Math.sin(fromRads[0])
      * Math.cos(toRads[0]) * Math.cos(diffRads[1]);

    //console.log(`toDegrees: (x, y) => (${x}, ${y})`);
    let a = Math.atan2(y, x);
    // Convert to counter clockwise
    let h = this.toCounterClockwise(a);

    return h;
  }


  distance(from: Whereabout, to: Whereabout): number {
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

      //console.log(`distance()... fromRads: ${fromRads} toRads: ${toRads} diffRads: ${diffRads}`);

      // Use the haversine formula to calculate distance in meters
      let a = Math.sin(diffRads[0] / 2) * Math.sin(diffRads[0] / 2) +
        Math.cos(fromRads[0]) * Math.cos(toRads[0]) *
        Math.sin(diffRads[1] / 2) * Math.sin(diffRads[1] / 2);

      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      d = this.R * c;
    } catch (e) {
      console.log(`Something terrible has happened ${e}`);
    }

    return d;
  }
}

// Equations ripped from http://www.movable-type.co.uk/scripts/latlong.html
