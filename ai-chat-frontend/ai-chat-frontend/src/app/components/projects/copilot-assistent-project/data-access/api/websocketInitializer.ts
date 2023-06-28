import { Injectable, OnInit } from '@angular/core';
import { WebSocketService } from 'src/app/components/projects/copilot-assistent-project/data-access/api/websocket';

@Injectable({
  providedIn: 'root'
})

export class WebsocketHubService implements OnInit {

  constructor(private webSocketService: WebSocketService) { }

  ngOnInit(): void {
    this.webSocketService.connect();
  }
}
