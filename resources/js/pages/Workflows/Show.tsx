import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { ArrowLeft, Play, Pencil, Trash2, Plus, Clock, Globe, CheckCircle, XCircle, Loader2, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWorkflowRunner } from '@/hooks/useWorkflowRunner';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

interface Step {
    id: number;
    type: 'delay' | 'http_check';
    config: { seconds?: number; url?: string };
    step_order: number;
}

interface Run {
    id: number;
    status: 'running' | 'succeeded' | 'failed';
    started_at: string;
    finished_at: string | null;
}

interface Workflow {
    id: number;
    name: string;
    description: string | null;
    steps: Step[];
    runs: Run[];
}

interface Props {
    workflow: Workflow;
}

interface StepExecution {
    stepId: number;
    status: 'pending' | 'running' | 'success' | 'error';
    message?: string;
    countdown?: number;
}

function SortableStep({
    step,
    onDelete,
    isEditMode,
    execution
}: {
    step: Step;
    onDelete: (id: number) => void;
    isEditMode: boolean;
    execution?: StepExecution;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
        >
            {isEditMode && (
                <button
                    className="cursor-grab active:cursor-grabbing touch-none"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
            )}

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
                    <span className="font-medium">{step.type === 'http_check' ? 'HTTP Check' : 'Delay'}</span>

                    {/* Execution Status Badges */}
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
                <p className="text-sm text-muted-foreground">
                    {execution?.message || (
                        step.type === 'delay'
                            ? `Wait for ${step.config.seconds} seconds`
                            : `Check ${step.config.url}`
                    )}
                </p>
            </div>

            {isEditMode && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Step?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this {step.type === 'http_check' ? 'HTTP Check' : 'delay'} step?
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => onDelete(step.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}

export default function WorkflowsShow({ workflow }: Props) {
    const [showAddStep, setShowAddStep] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [steps, setSteps] = useState<Step[]>(workflow.steps);
    const { isRunning, executions, runWorkflow } = useWorkflowRunner(workflow.id, steps);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Workflows', href: '/workflows' },
        { title: workflow.name, href: `/workflows/${workflow.id}` },
    ];

    // Sync local steps state with workflow prop
    useEffect(() => {
        setSteps(workflow.steps);
    }, [workflow.steps]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { data, setData, post, processing, reset } = useForm({
        type: 'delay' as 'delay' | 'http_check',
        config: { seconds: 1, url: '' },
    });

    const handleAddStep = (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            type: data.type,
            config: data.type === 'delay'
                ? { seconds: data.config.seconds }
                : { url: data.config.url },
        };
        router.post(`/workflows/${workflow.id}/steps`, submitData, {
            onSuccess: () => {
                reset();
                setShowAddStep(false);
                router.reload({ only: ['workflow'] });
            },
        });
    };

    const handleRunWorkflow = async () => {
        await runWorkflow();
    };

    const handleDeleteStep = (stepId: number) => {
        router.delete(`/steps/${stepId}`, {
            onSuccess: () => {
                setSteps(steps.filter(s => s.id !== stepId));
                toast.success('Step deleted successfully');
            },
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = steps.findIndex((s) => s.id === active.id);
            const newIndex = steps.findIndex((s) => s.id === over.id);

            const newSteps = arrayMove(steps, oldIndex, newIndex).map((s, idx) => ({
                ...s,
                step_order: idx + 1,
            }));

            setSteps(newSteps);

            // Send reorder request to backend
            router.post(`/workflows/${workflow.id}/steps/reorder`, {
                steps: newSteps.map(s => s.id),
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Steps reordered successfully');
                },
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'running': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'succeeded': return <Badge className="bg-green-500/20 text-green-500">Succeeded</Badge>;
            case 'failed': return <Badge className="bg-red-500/20 text-red-500">Failed</Badge>;
            case 'running': return <Badge className="bg-blue-500/20 text-blue-500">Running</Badge>;
            default: return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={workflow.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/workflows">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{workflow.name}</h1>
                            {workflow.description && (
                                <p className="text-muted-foreground">{workflow.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/workflows/${workflow.id}/edit`}>
                            <Button variant="outline">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button onClick={handleRunWorkflow} disabled={isRunning}>
                            <Play className="mr-2 h-4 w-4" />
                            Run Workflow
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Steps Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Steps</CardTitle>
                                    <CardDescription>
                                        {steps.length} step(s){isEditMode && ' • Drag to reorder'}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={isEditMode ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setIsEditMode(!isEditMode);
                                            if (isEditMode) setShowAddStep(false);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        {isEditMode ? 'Done' : 'Edit'}
                                    </Button>
                                    {isEditMode && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAddStep(!showAddStep)}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Step
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Add Step Form */}
                            {showAddStep && (
                                <Card className="border-dashed">
                                    <CardContent className="pt-4">
                                        <form onSubmit={handleAddStep} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Step Type</Label>
                                                <Select
                                                    value={data.type}
                                                    onValueChange={(v: 'delay' | 'http_check') => setData('type', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="delay">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                Delay
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="http_check">
                                                            <div className="flex items-center gap-2">
                                                                <Globe className="h-4 w-4" />
                                                                HTTP Check
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {data.type === 'delay' ? (
                                                <div className="space-y-2">
                                                    <Label>Seconds (max 2)</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="2"
                                                        value={data.config.seconds}
                                                        onChange={(e) => setData('config', { ...data.config, seconds: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Label>URL</Label>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://example.com"
                                                        value={data.config.url}
                                                        onChange={(e) => setData('config', { ...data.config, url: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <Button type="submit" size="sm" disabled={processing}>
                                                    Add Step
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowAddStep(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Sortable Steps List */}
                            {steps.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No steps yet. Add your first step above.
                                </p>
                            ) : isEditMode ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={steps.map(s => s.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2">
                                            {steps.map((step) => (
                                                <SortableStep
                                                    key={step.id}
                                                    step={step}
                                                    onDelete={handleDeleteStep}
                                                    isEditMode={isEditMode}
                                                    execution={executions[step.id]}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="space-y-2">
                                    {steps.map((step) => (
                                        <SortableStep
                                            key={step.id}
                                            step={step}
                                            onDelete={handleDeleteStep}
                                            isEditMode={isEditMode}
                                            execution={executions[step.id]}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Run History Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Run History</CardTitle>
                            <CardDescription>Recent workflow executions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {workflow.runs.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No runs yet. Click "Run Workflow" to execute.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {workflow.runs.map((run) => (
                                        <Link
                                            key={run.id}
                                            href={`/runs/${run.id}`}
                                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            {getStatusIcon(run.status)}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Run #{run.id}</span>
                                                    {getStatusBadge(run.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Intl.DateTimeFormat('en-US', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    }).format(new Date(run.started_at))}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
