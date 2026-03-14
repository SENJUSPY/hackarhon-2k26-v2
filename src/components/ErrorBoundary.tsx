import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let errorDetails = null;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Firestore ${parsed.operationType} error: ${parsed.error}`;
            errorDetails = parsed;
          } else {
            errorMessage = this.state.error.message;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg p-8 rounded-[2rem] shadow-2xl border border-muted/20">
            <h2 className="text-3xl font-display text-dark mb-4 leading-none">SOMETHING WENT WRONG</h2>
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6">
              <p className="text-red-600 text-sm font-body">
                {errorMessage}
              </p>
              {errorDetails && (
                <div className="mt-2 pt-2 border-t border-red-100 text-[10px] text-red-400 font-mono break-all">
                  Path: {errorDetails.path}
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-accent text-dark font-display uppercase tracking-widest rounded-2xl hover:bg-dark hover:text-bg transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
