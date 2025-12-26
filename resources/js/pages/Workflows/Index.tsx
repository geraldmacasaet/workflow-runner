import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Play, Pencil, Trash2, Plus, Clock, Globe, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { useWorkflowRunner } from '@/hooks/useWorkflowRunner';
import { toast } from 'sonner';

interface Workflow {
    id: number;
    name: string;
    description: string | null;
    steps_count: number;
    runs_count: number;
    created_at: string;
}

interface Step {
    id: number;
    type: 'delay' | 'http_check';
    config: { seconds?: number; url?: string };
    step_order: number;
}

interface Props {
    workflows: Workflow[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workflows', href: '/workflows' },
];

export default function WorkflowsIndex({ workflows }: Props) {
    const [deleteConfirmText, setDeleteConfirmText] = useState<Record<number, string>>({});
    const [showExecutionModal, setShowExecutionModal] = useState(false);
    const [activeSteps, setActiveSteps] = useState<Step[]>([]);
    const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);

    const { isRunning, executions, runWorkflow } = useWorkflowRunner();

    const handleRunWorkflow = async (workflow: Workflow) => {
        try {
            setActiveWorkflow(workflow);
            setShowExecutionModal(true);
            setActiveSteps([]); // Reset steps while loading

            const response = await fetch(`/workflows/${workflow.id}/steps-json`);
            if (!response.ok) throw new Error('Failed to fetch steps');

            const steps = await response.json();
            setActiveSteps(steps);

            // Small delay to ensure modal is rendered
            await new Promise(resolve => setTimeout(resolve, 100));
            await runWorkflow(workflow.id, steps);
        } catch (error) {
            console.error('Failed to run workflow:', error);
            toast.error('Failed to start workflow execution');
            setShowExecutionModal(false);
        }
    };

    const handleDelete = (id: number) => {
        if (deleteConfirmText[id]?.toLowerCase() === 'delete') {
            router.delete(`/workflows/${id}`);
            setDeleteConfirmText(prev => ({ ...prev, [id]: '' }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workflows" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Workflows</h1>
                        <p className="text-muted-foreground">Manage and run your workflow automations</p>
                    </div>
                    <Link href="/workflows/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Workflow
                        </Button>
                    </Link>
                </div>

                {workflows.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-12">
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-4">No workflows yet. Create your first one!</p>
                            <Link href="/workflows/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Workflow
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {workflows.map((workflow) => (
                            <Card key={workflow.id} className="hover:shadow-lg transition-shadow flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                                        <div className="flex gap-1">
                                            <Badge variant="secondary">{workflow.steps_count} steps</Badge>
                                            <Badge variant="outline">{workflow.runs_count} runs</Badge>
                                        </div>
                                    </div>
                                    {workflow.description && (
                                        <CardDescription className="line-clamp-2">
                                            {workflow.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardFooter className="mt-auto pt-4 border-t">
                                    <div className="flex gap-2 w-full">
                                        <div className="flex gap-2 flex-1">
                                            <Link href={`/workflows/${workflow.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/workflows/${workflow.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleRunWorkflow(workflow)}
                                                disabled={isRunning}
                                            >
                                                <Play className="h-4 w-4" />
                                                Run
                                            </Button>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the workflow
                                                        <strong className="block mt-1">{workflow.name}</strong>
                                                        and all its steps and run history.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="py-4">
                                                    <label className="text-sm font-medium mb-2 block">
                                                        Type <strong>delete</strong> to confirm:
                                                    </label>
                                                    <Input
                                                        value={deleteConfirmText[workflow.id] || ''}
                                                        onChange={(e) => setDeleteConfirmText(prev => ({
                                                            ...prev,
                                                            [workflow.id]: e.target.value
                                                        }))}
                                                        placeholder="delete"
                                                    />
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setDeleteConfirmText(prev => ({ ...prev, [workflow.id]: '' }))}>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(workflow.id)}
                                                        disabled={deleteConfirmText[workflow.id]?.toLowerCase() !== 'delete'}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                                                    >
                                                        Delete Workflow
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Execution Progress Modal */}
            <Dialog open={showExecutionModal} onOpenChange={setShowExecutionModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Workflow Execution: {activeWorkflow?.name}</DialogTitle>
                        <DialogDescription>
                            {activeSteps.length === 0 ? 'Loading steps...' : 'Running workflow steps in real-time...'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        {activeSteps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <p>Checking workflow steps...</p>
                            </div>
                        ) : (
                            activeSteps.map((step) => {
                                const execution = executions[step.id];
                                return (
                                    <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                                            {step.step_order}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {step.type === 'delay' ? (
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="font-medium">
                                                    {step.type === 'http_check' ? 'HTTP Check' : 'Delay'}
                                                </span>

                                                {execution?.status === 'running' && (
                                                    <Badge className="bg-blue-500/20 text-blue-500 border-none">
                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        {execution.countdown ? `${execution.countdown}s` : 'Running'}
                                                    </Badge>
                                                )}
                                                {execution?.status === 'success' && (
                                                    <Badge className="bg-green-500/20 text-green-500 border-none">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Done
                                                    </Badge>
                                                )}
                                                {execution?.status === 'error' && (
                                                    <Badge className="bg-red-500/20 text-red-500 border-none">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Failed
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {execution?.message || (
                                                    step.type === 'delay'
                                                        ? `Wait for ${step.config.seconds} seconds`
                                                        : `Check ${step.config.url}`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {!isRunning && activeSteps.length > 0 && (
                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setShowExecutionModal(false)}>
                                Close
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
