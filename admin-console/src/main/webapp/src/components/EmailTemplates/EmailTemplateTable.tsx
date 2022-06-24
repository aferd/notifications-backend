import { Breadcrumb, BreadcrumbItem, Button, PageSection, Spinner, Title, Toolbar,
    ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { EyeIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import {
    TableComposable,
    Tbody,
    Td,  Th,   Thead,
    Tr } from '@patternfly/react-table';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { useUserPermissions } from '../../app/PermissionContext';
import { linkTo } from '../../Routes';
import { useGetTemplates } from '../../services/EmailTemplates/GetTemplates';
import { ViewTemplateModal } from './ViewEmailTemplateModal';

interface EmailTemplateTableProps {
    application: string;
}

export const EmailTemplateTable: React.FunctionComponent<EmailTemplateTableProps> = props => {
    const { hasPermission } = useUserPermissions();
    const getAllTemplates = useGetTemplates();

    const [ showViewModal, setShowViewModal ] = React.useState(false);
    const viewModal = () => {
        setShowViewModal(true);
    };

    const onClose = () => {
        setShowViewModal(false);
    };

    const columns = [ 'Email Templates' ];

    if (getAllTemplates.loading) {
        return <Spinner />;
    }

    if (getAllTemplates.payload?.status !== 200) {
        return <span>Error while loading templates: {getAllTemplates.errorObject.toString()}</span>;
    }

    return (
        <React.Fragment>
            <PageSection>
                <Title headingLevel="h1">
                    <Breadcrumb>
                        <BreadcrumbItem target='#'>Email Templates</BreadcrumbItem>
                    </Breadcrumb></Title>
                <TableComposable aria-label="Email Template table">
                    <Thead>
                        <Toolbar>
                            <ToolbarContent>
                                <ToolbarItem>
                                    <Button variant="primary" isDisabled={ !hasPermission(props.application) }
                                        component={ (props: any) =>
                                            <Link { ...props } to={ linkTo.emailTemplates } /> }>Create Email Template</Button>
                                    <ViewTemplateModal
                                        showModal={ showViewModal }
                                        applicationName={ props.application }
                                        onClose={ onClose }
                                    />
                                </ToolbarItem>
                            </ToolbarContent>
                        </Toolbar>
                        <Tr>
                            {columns.map((column, columnIndex) => (
                                <Th key={ columnIndex }>{column}</Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        { getAllTemplates.payload.value.map(e => (
                            <Tr key={ e.id }>
                                <Td>{ e.name }</Td>
                                <Td>
                                    <Button className='view' type='button' variant='plain' onClick={ viewModal }
                                    > { <EyeIcon /> } </Button></Td>
                                <Td>
                                    <Button className='edit' type='button' variant='plain'
                                        isDisabled> { <PencilAltIcon /> } </Button></Td>
                                <Td>
                                    <Button className='delete' type='button' variant='plain'
                                        isDisabled>{ <TrashIcon /> } </Button></Td>
                            </Tr>
                        ))}
                    </Tbody>
                </TableComposable>
            </PageSection>
        </React.Fragment>

    );
};

