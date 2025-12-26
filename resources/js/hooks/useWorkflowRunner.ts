import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Step {
    id: number;
    type: 'delay' | 'http_check';
    config: { seconds?: number; url?: string };
    step_order: number;
}

interface StepExecution {
    stepId: number;
    status: 'pending' | 'running' | 'success' | 'error';
    message?: string;
    countdown?: number;
}

export function useWorkflowRunner(initialWorkflowId?: number, initialSteps: Step[] = []) {
    const [isRunning, setIsRunning] = useState(false);
    const [executions, setExecutions] = useState<Record<number, StepExecution>>({});

    const updateStepStatus = (stepId: number, updates: Partial<StepExecution>) => {
        setExecutions(prev => ({
            ...prev,
            [stepId]: { ...prev[stepId], stepId, ...updates },
        }));
    };

    const executeDelay = async (step: Step): Promise<void> => {
        const seconds = step.config.seconds || 1;
        updateStepStatus(step.id, { status: 'running', countdown: seconds });

        for (let i = seconds; i > 0; i--) {
            updateStepStatus(step.id, { countdown: i });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        updateStepStatus(step.id, { status: 'success', message: `Waited ${seconds} second(s)` });
    };

    const executeHttpCheck = async (step: Step): Promise<void> => {
        const url = step.config.url || '';
        updateStepStatus(step.id, { status: 'running', message: `Checking ${url}...` });

        try {
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
            });

            // Note: with mode 'no-cors', response.status is always 0 and ok is false
            // but the fetch only succeeds if the network request completes.
            // This is a limitation of opaque responses.
            // If the URL is on the same origin or has CORS headers, we can do better.

            updateStepStatus(step.id, {
                status: 'success',
                message: `URL is reachable (Connection established)`
            });
        } catch (error) {
            updateStepStatus(step.id, {
                status: 'error',
                message: `Failed to reach URL`
            });
            throw error;
        }
    };

    const runWorkflow = async (overrideWorkflowId?: number, overrideSteps?: Step[]) => {
        const workflowId = overrideWorkflowId || initialWorkflowId;
        const steps = overrideSteps || initialSteps;

        if (!workflowId || !steps || steps.length === 0) {
            toast.error('No steps to run');
            return;
        }

        setIsRunning(true);
        setExecutions({});

        // Initialize all steps as pending
        steps.forEach(step => {
            updateStepStatus(step.id, { status: 'pending' });
        });

        try {
            for (const step of steps) {
                if (step.type === 'delay') {
                    await executeDelay(step);
                } else if (step.type === 'http_check') {
                    await executeHttpCheck(step);
                }
            }

            // All steps completed successfully
            toast.success('Workflow completed successfully!');

            // Submit to backend using Inertia (handles CSRF automatically)
            router.post(`/workflows/${workflowId}/run`, {}, {
                preserveState: true,
                onSuccess: (page) => {
                    // Backend returns JSON with runId
                    const data = page.props as any;

                    // Check if runId is in the response or flash
                    const runId = data.runId || data.flash?.runId;
                    if (runId) {
                        router.visit(`/runs/${runId}`);
                    } else {
                        toast.error('Could not navigate to results');
                    }
                },
                onError: (errors) => {
                    toast.error('Failed to save workflow run');
                }
            });
        } catch (error) {
            toast.error('Workflow execution failed');

            // Still submit to backend to record the failure
            router.post(`/workflows/${workflowId}/run`, {}, {
                preserveState: true,
                onSuccess: (page) => {
                    const data = page.props as any;
                    const runId = data.runId || data.flash?.runId;
                    if (runId) {
                        router.visit(`/runs/${runId}`);
                    }
                },
                onError: (errors) => {
                    console.error('Failed to save run:', errors);
                }
            });
        } finally {
            setIsRunning(false);
        }
    };

    return {
        isRunning,
        executions,
        runWorkflow,
    };
}
