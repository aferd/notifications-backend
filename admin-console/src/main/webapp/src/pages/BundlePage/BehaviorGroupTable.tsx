import { Breadcrumb, BreadcrumbItem, Button, PageSection, Spinner,
    Title, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import * as React from 'react';

import { CreateEditBehaviorGroupModal } from '../../components/SystemBehaviorGroups/CreateEditBehaviorGroupModal';
import { DeleteBehaviorGroupModal } from '../../components/SystemBehaviorGroups/DeleteBehaviorGroupModal';
import { useBundleTypes } from '../../services/Applications/GetBundleById';
import { useCreateSystemBehaviorGroup } from '../../services/SystemBehaviorGroups/CreateSystemBehaviorGroup';
import { useDeleteBehaviorGroup } from '../../services/SystemBehaviorGroups/DeleteSystemBehaviorGroup';
import { useSystemBehaviorGroups } from '../../services/SystemBehaviorGroups/GetBehaviorGroups';
import { BehaviorGroup } from '../../types/Notifications';

interface BundlePageProps {
    bundleId: string;
    bundle: string | undefined;
}

export const BehaviorGroupsTable: React.FunctionComponent<BundlePageProps> = (props) => {
    const getBehaviorGroups = useSystemBehaviorGroups();
    const getBundles = useBundleTypes(props.bundleId);
    const newBehaviorGroup = useCreateSystemBehaviorGroup();
    const deleteBehaviorGroupMutation = useDeleteBehaviorGroup();

    const columns = [ 'System Behavior Group', 'Action' ];

    const [ showModal, setShowModal ] = React.useState(false);
    const [ showDeleteModal, setShowDeleteModal ] = React.useState(false);

    const [ isEdit, setIsEdit ] = React.useState(false);

    const [ systemBehaviorGroup, setSystemBehaviorGroup ] = React.useState<Partial<BehaviorGroup>>({});

    const createBehaviorGroup = () => {
        setShowModal(true);
        setIsEdit(false);
        setSystemBehaviorGroup({});
    };

    const editSystemBehaviorGroup = (b: BehaviorGroup) => {
        setShowModal(true);
        setIsEdit(true);
        setSystemBehaviorGroup(b);

    };

    const deleteBehaviorGroupModal = (b: BehaviorGroup) => {
        setShowDeleteModal(true);
        setSystemBehaviorGroup(b);
    };

    const handleSubmit = React.useCallback((systemBehaviorGroup) => {
        setShowModal(false);
        const mutate = newBehaviorGroup.mutate;
        mutate({
            id: systemBehaviorGroup.id,
            displayName: systemBehaviorGroup.displayName ?? '',
            actions: systemBehaviorGroup.actions,
            bundleId: systemBehaviorGroup.bundleId
        }).then(getBehaviorGroups.query);

    }, [ getBehaviorGroups.query, newBehaviorGroup.mutate ]);

    const handleDelete = React.useCallback(async () => {
        setShowDeleteModal(false);
        const deleteBehaviorGroup = deleteBehaviorGroupMutation.mutate;
        const response = await deleteBehaviorGroup(systemBehaviorGroup.id);
        if (response.error) {
            return false;
        }

        return true;
    }, [ deleteBehaviorGroupMutation.mutate, systemBehaviorGroup.id ]);

    const onClose = () => {
        setShowModal(false);
        getBehaviorGroups.query;
    };

    const onDeleteClose = () => {
        setShowDeleteModal(false);
        getBehaviorGroups.query;
    };

    if (getBehaviorGroups.loading) {
        return <Spinner />;
    }

    if (getBehaviorGroups.payload?.status !== 200) {
        return <span>Error while loading sysem behavior groups: {getBehaviorGroups.errorObject.toString()}</span>;
    }

    return (
        <React.Fragment>
            <PageSection>
                <Title headingLevel='h1'>
                    <Breadcrumb>
                        <BreadcrumbItem target='#'> Bundles </BreadcrumbItem>
                        <BreadcrumbItem target='#' >{ (getBundles.loading || getBundles.payload?.status !== 200)
                            ? <Spinner /> : getBundles.payload.value.displayName }
                        </BreadcrumbItem>
                        <BreadcrumbItem target='#'> System Behavior Groups </BreadcrumbItem>
                    </Breadcrumb>
                </Title>
                <TableComposable aria-label="System behavior groups table">
                    <Thead>
                        <Toolbar>
                            <ToolbarContent>
                                <ToolbarItem>
                                    <Button variant='primary' type='button' onClick={ createBehaviorGroup }> Create new group </Button>
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
                        { getBehaviorGroups.payload.value.map(b =>
                            <Tr key={ b.id }>
                                <Td>{ b.displayName }</Td>
                                <Td>{ b.actions }</Td>
                                <Td>
                                    <Button className='edit' type='button' variant='plain'
                                        onClick={ () => editSystemBehaviorGroup(b) }
                                    > { <PencilAltIcon /> } </Button></Td>
                                <Td>
                                    <Button className='delete' type='button' variant='plain'
                                        onClick={ () => deleteBehaviorGroupModal(b) }
                                    >{ <TrashIcon /> } </Button></Td>
                            </Tr>
                        )}
                    </Tbody>
                </TableComposable>
            </PageSection>
            <CreateEditBehaviorGroupModal
                isEdit={ isEdit }
                initialSystemBehaviorGroup={ systemBehaviorGroup }
                showModal={ showModal }
                onClose={ onClose }
                onSubmit={ handleSubmit }
                isLoading={ false }
            />
            <DeleteBehaviorGroupModal
                onDelete={ handleDelete }
                bundleName={ props.bundle }
                systemBehaviorGroupName={ systemBehaviorGroup.displayName }
                isOpen={ showDeleteModal }
                onClose={ onDeleteClose }
            />
        </React.Fragment>

    );
};

