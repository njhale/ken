import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import * as io from 'socket.io-client';

import { Whereabout } from './../models/whereabout';

@Injectable()
export class WhereaboutService {
  public socket;
  /**
  * @http: used to make get requests to the Nodejs server
  */
  constructor(private http: Http) {}

  socketConnect(): void {
    this.socket = io(window.location.origin);
  }

  socketDisconnect(): void {
    this.socket.emit('disconnect');
  }

  getMessages(): Observable<{}> {
    let observable = new Observable(observer => {
      this.socket.on('whereabouts', (data) => {
        //console.log('getting whereabout data...', data);
        observer.next(data as Whereabout);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }


  /**
  * Handle any errors that may occur.
  */
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
