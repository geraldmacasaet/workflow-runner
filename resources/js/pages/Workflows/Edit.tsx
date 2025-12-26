import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface Workflow {
    id: number;
    name: string;
    description: string | null;
}

interface Props {
    workflow: Workflow;
}

export default function WorkflowsEdit({ workflow }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Workflows', href: '/workflows' },
        { title: workflow.name, href: `/workflows/${workflow.id}` },
        { title: 'Edit', href: `/workflows/${workflow.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: workflow.name,
        description: workflow.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/workflows/${workflow.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${workflow.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link href={`/workflows/${workflow.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Workflow</h1>
                        <p className="text-muted-foreground">Update workflow details</p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Workflow Details</CardTitle>
                        <CardDescription>
                            Update the workflow name and description
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="My Workflow"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What does this workflow do?"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Link href={`/workflows/${workflow.id}`}>
                                    <Button variant="outline" type="button">Cancel</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
