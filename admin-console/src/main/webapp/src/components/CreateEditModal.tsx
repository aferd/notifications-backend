import { ActionGroup, Button, Form, FormGroup, HelperText, HelperTextItem, Modal, ModalVariant,
    Spinner, TextArea, TextInput } from '@patternfly/react-core';
import React from 'react';

import { EventType } from '../types/Notifications';

interface CreateEditModalProps {
    isEdit: boolean;
    showModal: boolean;
    applicationName?: string;
    initialEventType?: EventType;
    isLoading?: boolean;
    onClose: () => void;
    onSubmit: () => void;
    eventTypeQuery: unknown;

}

export const CreateEditModal: React.FunctionComponent<CreateEditModalProps> = (props) => {
    const [ eventType, setEventType ] = React.useState<Partial<EventType>>(props.initialEventType ?? {});

    const handleChange = (value: string, event: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLTextAreaElement>) => {
        const target = event.target as HTMLInputElement;
        setEventType(prev => ({ ...prev, [target.name]: target.value }));
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
                            value={ eventType.name }
                            onChange={ handleChange }
                            id='name'
                            name="name"
                        /></FormGroup>
                    <FormGroup label='Display name' fieldId='display-name' isRequired
                        helperText='This is the name you want to display on the UI'>
                        <TextInput
                            type='text'
                            value={ eventType.displayName }
                            onChange={ handleChange }
                            id='display-name'
                            name="displayName"
                        /></FormGroup>
                    <FormGroup label='Description' fieldId='description'
                        helperText='Optional short description that appears in the UI
                                                to help admin descide how to notify users.'>
                        <TextArea
                            type='text'
                            value={ eventType.description }
                            onChange={ handleChange }
                            id='description'
                            name="description"
                        /></FormGroup>
                    <ActionGroup>
                        <Button variant='primary' type='submit'
                            { ...props.isLoading ? <Spinner /> : props.eventTypeQuery }
                            onClick={ props.onSubmit }>{ props.isEdit ? 'Update' : 'Submit' }</Button>
                        <Button variant='link' type='reset'
                            onClick={ props.onClose }>Cancel</Button>
                    </ActionGroup>
                </Form>
            </Modal>
        </React.Fragment>
    );
};

