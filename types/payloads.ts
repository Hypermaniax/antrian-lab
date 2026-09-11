export interface CreateQueueServicePayload {
  code: string;
  name: string;
  prefix: string;
  description?: string | null;
}

export interface UpdateQueueServicePayload {
  name?: string;
  prefix?: string;
  description?: string | null;
}

export interface CreateStationPayload {
  queueServiceId: string;
  name: string;
  code: string;
  stage: string;
}

export interface UpdateStationPayload {
  name?: string;
  stage?: string;
  queueServiceId?: string;
}

export interface CreateQueuePayload {
  queueServiceId: string;
  patientName?: string;
  patientId?: string;
}

export interface QueueServiceContext {
  id: string;
  code: string;
  prefix: string;
}

export interface StationContext {
  id: string;
  stage: string;
}

export interface QueueContext {
  id: string;
  currentStage: string;
  currentStationId: string | null;
}

export interface CompletionConfig {
  nextStage: string | null;
  nextStatus: string;
  completedEvent: string;
  autoCallStage: string | null;
}
