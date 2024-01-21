import {Form} from "../Form/Form";
import {z} from "zod";
import {TextField} from "../Form/TextField";
import {TextArea} from "../Form/TextArea";
import {updateBackendCourseHeaderData} from "../logic/backend/backend";

const formSchema = z.object({
    title: z.string().min(1, "Title cannot be empty"),
    description: z.string(),
}).strict();
type FormData = z.infer<typeof formSchema>;

export interface CourseHeaderDataPanelProps {
    courseId: number;
    title: string;
    description: string;
    onDataUpdatedInBackend: () => void;
}

export function CourseHeaderDataPanel(props: CourseHeaderDataPanelProps) {
    const defaultValues: FormData = {
        title: props.title,
        description: props.description,
    };
    async function onSubmit(data: FormData) {
        await updateBackendCourseHeaderData(props.courseId, {
            title: data.title,
            description: data.description,
        });
        props.onDataUpdatedInBackend();
    }
    return <Form schema={formSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
        <TextField name="title" label="Title" />
        <TextArea name="description" label="Description" />
    </Form>;
}
