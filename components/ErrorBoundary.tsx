import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fix: Explicitly extend Component and use constructor to ensure correct type inference for props and state
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center font-sans text-red-900" dir="ltr">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200 max-w-lg w-full overflow-auto">
            <p className="font-mono text-sm text-red-600 whitespace-pre-wrap break-words text-left">
              {this.state.error?.message}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}