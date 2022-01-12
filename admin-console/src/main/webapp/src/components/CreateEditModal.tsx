import { ActionGroup, Button, Form, FormGroup, HelperText, HelperTextItem, Modal, ModalVariant,
    Spinner, TextArea, TextInput } from '@patternfly/react-core';
import React from 'react';

import { useCreateEventType } from '../services/CreateEventTypes';

interface CreateEditModalProps {
    isEdit: boolean;
    showModal: boolean;
    applicationName?: string;
    eventTypeName?: string;
    eventTypeDisplayName?: string;
    eventTypeDescription?: string;
    onClose: () => void;
    onSubmit: () => void;
    eventTypeQuery: unknown;

}

export const CreateEditModal: React.FunctionComponent<CreateEditModalProps> = (props) => {
    const newEvent = useCreateEventType();

    const handleChange = (value: string, event: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLTextAreaElement>) => {
        const target = event.target as HTMLInputElement;
        ((prev: any) => ({ ...prev, [target.name]: target.value }));
    };

    return (
        <React.Fragment>
            <Modal
                variant={ ModalVariant.medium }
                title={ `${ props.isEdit ? 'Update' : 'Create'} Event Type for ${ props.applicationName }` }
                isOpen={ props.showModal }
                onClose={ props.onClose }
            ><Form isHorizontal>
                    <FormGroup label='Name' fieldId='name' isRequired
                        helperText={ props.isEdit ? <HelperText><HelperTextItem variant="warning" hasIcon>
                                                    If this field is modified it may affect exisiting behavior.
                        </HelperTextItem></HelperText> : 'This is a short name, only composed of a-z 0-9 and - characters.' }>
                        <TextInput
                            type='text'
                            value={ props.eventTypeName }
                            onChange={ handleChange }
                            id='name'
                            name="name"
                        /></FormGroup>
                    <FormGroup label='Display name' fieldId='display-name' isRequired
                        helperText='This is the name you want to display on the UI'>
                        <TextInput
                            type='text'
                            value={ props.eventTypeDisplayName }
                            onChange={ handleChange }
                            id='display-name'
                            name="displayName"
                        /></FormGroup>
                    <FormGroup label='Description' fieldId='description'
                        helperText='Optional short description that appears in the UI
                                                to help admin descide how to notify users.'>
                        <TextArea
                            type='text'
                            value={ props.eventTypeDescription }
                            onChange={ handleChange }
                            id='description'
                            name="description"
                        /></FormGroup>
                    <ActionGroup>
                        <Button variant='primary' type='submit'
                            { ...(newEvent.loading || newEvent.payload?.status !== 200) ?
                                <Spinner /> : props.eventTypeQuery }
                            onClick={ props.onSubmit }>{ props.isEdit ? 'Update' : 'Submit' }</Button>
                        <Button variant='link' type='reset'
                            onClick={ props.onClose }>Cancel</Button>
                    </ActionGroup>
                </Form>
            </Modal>
        </React.Fragment>
    );
};