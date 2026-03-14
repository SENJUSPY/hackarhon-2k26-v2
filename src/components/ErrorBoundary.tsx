import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-none shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-none mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-display uppercase tracking-tighter text-snow mb-4">Something went wrong</h2>
            <p className="text-silver text-sm mb-8 leading-relaxed font-light">
              An unexpected error occurred. We've been notified and are looking into it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green text-obsidian py-4 uppercase text-xs font-bold tracking-widest hover:bg-snow transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
