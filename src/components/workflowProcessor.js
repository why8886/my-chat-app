// workflowProcessor.js
class WorkflowProcessor {
  constructor() {
    this.sessions = new Map();
    this.messageBuffer = new Map();
  }

  processChunk(chunk) {
    const { event, conversation_id } = chunk;
    switch(event) {
      case 'workflow_started':
        return this._handleWorkflowStart(chunk);
      case 'node_started':
        return this._handleNodeStart(chunk);
      case 'node_finished':
        return this._handleNodeEnd(chunk);
      case 'message':
        return this._handleMessage(chunk);
      default:
        console.warn(`Unhandled event type: ${event}`);
    }
  }

  _handleWorkflowStart(data) {
    this.sessions.set(data.conversation_id, {
      nodes: new Map(),
      messages: [],
      startTime: data.created_at
    });
    return {
      type: 'WORKFLOW_START',
      data: data.data
    };
  }
}
