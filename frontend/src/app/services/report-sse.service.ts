import { Injectable, signal } from '@angular/core';
import { Report } from './report-api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportSSEService {
  private eventSource: EventSource | null = null;
  private readonly connectionStatus =
    signal<'disconnected' | 'connecting' | 'connected'>('disconnected');

  getConnectionStatus() {
    return this.connectionStatus.asReadonly();
  }

  connect(url: string, onMessage: (report: Report) => void, onError?: (error: Event) => void): void {

    if (this.eventSource) {
      this.disconnect();
    }

    console.log('Connecting to SSE stream:', url);
    this.connectionStatus.set('connecting');

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
      this.connectionStatus.set('connected');
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

      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('Attempting to reconnect...');
          this.connect(url, onMessage, onError);
        }
      }, 5000);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connectionStatus.set('disconnected');
    }
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

