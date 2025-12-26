import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Clock, Globe, AlertCircle, Info } from 'lucide-react';

interface Step {
    id: number;
    type: 'delay' | 'http_check';
    config: { seconds?: number; url?: string };
}

interface RunLog {
    id: number;
    step_id: number | null;
    step: Step | null;
    level: 'info' | 'warn' | 'error';
    message: string;
    logged_at: string;
}

interface Workflow {
    id: number;
    name: string;
}

interface Run {
    id: number;
    workflow: Workflow;
    status: 'running' | 'succeeded' | 'failed';
    started_at: string;
    finished_at: string | null;
    logs: RunLog[];
}

interface Props {
    run: Run;
}

export default function RunsShow({ run }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Workflows', href: '/workflows' },
        { title: run.workflow.name, href: `/workflows/${run.workflow.id}` },
        { title: `Run #${run.id}`, href: `/runs/${run.id}` },
    ];

    const getStatusIcon = () => {
        switch (run.status) {
            case 'succeeded': return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'failed': return <XCircle className="h-6 w-6 text-red-500" />;
            case 'running': return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
        }
    };

    const getStatusBadge = () => {
        switch (run.status) {
            case 'succeeded': return <Badge className="bg-green-500/20 text-green-500 text-lg px-3 py-1 border-none">Succeeded</Badge>;
            case 'failed': return <Badge className="bg-red-500/20 text-red-500 text-lg px-3 py-1 border-none">Failed</Badge>;
            case 'running': return <Badge className="bg-blue-500/20 text-blue-500 text-lg px-3 py-1 border-none animate-pulse">Running</Badge>;
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'info': return <Info className="h-4 w-4 text-blue-400" />;
            case 'warn': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
            case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
        }
    };

    const getLevelClass = (level: string) => {
        switch (level) {
            case 'info': return 'border-blue-400 bg-blue-500/5';
            case 'warn': return 'border-yellow-400 bg-yellow-500/5';
            case 'error': return 'border-red-400 bg-red-500/5';
            default: return '';
        }
    };

    const duration = run.finished_at
        ? ((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000).toFixed(2)
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Run #${run.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/workflows/${run.workflow.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div className={run.status === 'running' ? 'animate-bounce' : ''}>
                                {getStatusIcon()}
                            </div>
                            <h1 className="text-2xl font-bold">Run #{run.id}</h1>
                            {getStatusBadge()}
                        </div>
                        <p className="text-muted-foreground">
                            Workflow: {run.workflow.name}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-0">
                            <CardDescription>Started At</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {new Intl.DateTimeFormat('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                }).format(new Date(run.started_at))}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-0">
                            <CardDescription>Finished At</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {run.finished_at
                                    ? new Intl.DateTimeFormat('en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    }).format(new Date(run.finished_at))
                                    : 'In progress...'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardDescription>Duration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {duration ? `${duration}s` : 'Running...'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Logs */}
                <Card className="flex-1 overflow-hidden py-0 gap-1">
                    <CardHeader className="border-b py-4 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div className='flex flex-col justify-between'>
                                <CardTitle>Execution Timeline</CardTitle>
                                <CardDescription>{run.logs.length} events recorded</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[60vh] overflow-y-auto p-4">
                            {run.logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin mb-4 opacity-20" />
                                    <p>Waiting for log entries...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {run.logs.map((log, index) => (
                                        <div
                                            key={log.id}
                                            className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${getLevelClass(log.level)}`}
                                        >
                                            <div className="mt-1">
                                                {getLevelIcon(log.level)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(log.logged_at).toLocaleTimeString()}
                                                    </span>
                                                    {log.step && (
                                                        <Badge variant="outline" className="text-[10px] h-5">
                                                            {log.step.type === 'delay' ? 'DELAY' : 'HTTP CHECK'}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="secondary" className="text-[10px] h-5 uppercase tracking-wider">
                                                        {log.level}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed">{log.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
