import {
    ActionGroup,
    Button,
    Form,
    FormGroup,
    FormSelect,
    Modal,
    ModalVariant
} from '@patternfly/react-core';
import React from 'react';

import { InstantTemplate } from '../../types/Notifications';

interface InstantTemplateModalProps {
    isEdit: boolean;
    showModal: boolean;
    onClose: () => void;
    templates: string[] | undefined;
    initialInstantTemplate?: Partial<InstantTemplate>;
    onSubmit: (instantTemplate: Partial<InstantTemplate>) => void;
}

export const InstantTemplateModal: React.FunctionComponent<InstantTemplateModalProps> = (props) => {

    const [ instantTemplate, setInstantTemplate ] = React.useState<Partial<InstantTemplate>>(props.initialInstantTemplate ?? {});

    const handleChange = (value: string, event: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLSelectElement>) => {
        const target = event.target as HTMLSelectElement;
        setInstantTemplate(prev => ({ ...prev, [target.name]: target.value }));
    };

    const onSubmitLocal = React.useCallback(() => {
        props.onSubmit(instantTemplate);
    }, [ instantTemplate, props ]);

    React.useEffect(() => {
        setInstantTemplate(props.initialInstantTemplate ?? {});
    }, [ props.initialInstantTemplate ]);

    return (
        <React.Fragment>
            <Modal
                variant={ ModalVariant.medium }
                title={ `${ props.isEdit ? `Update` : 'Select'} your instant email templates` }
                isOpen={ props.showModal }
                onClose={ props.onClose }
            ><Form isHorizontal>
                    <FormGroup label='Subject template' fieldId='subject-template'>
                        <FormSelect
                            id="subject-template"
                            name="subject-template"
                            aria-label="Subject template"
                            onChange={ handleChange }
                            isRequired
                        >
                            { props.templates }
                        </FormSelect>
                    </FormGroup>
                    <FormGroup label='Body template' fieldId='body-template'>
                        <FormSelect
                            id="body-template"
                            name="body-template"
                            aria-label="Body template"
                            onChange={ handleChange }
                            isRequired
                        >
                            { props.templates }
                        </FormSelect>
                    </FormGroup>
                    <ActionGroup>
                        <Button variant='primary' type='submit'
                            onSubmit={ onSubmitLocal }
                        >{ props.isEdit ? 'Update' : 'Submit' }</Button>
                        <Button variant='link' type='reset'
                            onClick={ props.onClose }>Cancel</Button>
                    </ActionGroup>
                </Form>
            </Modal>
        </React.Fragment>
    );
};

