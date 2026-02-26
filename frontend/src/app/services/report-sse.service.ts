import { Injectable, signal } from '@angular/core';
import { Report } from './report-api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportSSEService {

  private eventSource: EventSource | null = null;
  private readonly connectionStatus =
    signal<'disconnected' | 'connecting' | 'connected'>('disconnected');
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  getConnectionStatus() {
    return this.connectionStatus.asReadonly();
  }

  connect(url: string, onMessage: (report: Report) => void, onError?: (error: Event) => void): void {
    if (this.eventSource) {
      this.disconnect();
    }

    this.reconnectAttempts = 0;
    console.log('Connecting to SSE stream:', url);
    this._doConnect(url, onMessage, onError);
  }

  private _doConnect(url: string, onMessage: (report: Report) => void, onError?: (error: Event) => void): void {

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.connectionStatus.set('disconnected');
      return;
    }

    this.connectionStatus.set('connecting');
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
      this.connectionStatus.set('connected');
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connection') {
          console.log('SSE connection message:', data.message);
          return;
        }

        const report: Report = {
          ...data,
          id: data.reportId || data.id
        };

        console.log('SSE message received:', report);
        onMessage(report);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error: Event) => {
      console.error('SSE connection error:', error);
      this.connectionStatus.set('disconnected');

      if (onError) {
        onError(error);
      }

      this.reconnectAttempts++;
      console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectTimeout = setTimeout(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            console.log('Attempting to reconnect...');
            this._doConnect(url, onMessage, onError);
          }
        }, this.reconnectDelay);
      }
    };
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connectionStatus.set('disconnected');
      console.log('SSE connection closed');
    }
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

