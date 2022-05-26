import { Spinner } from '@patternfly/react-core';
import * as React from 'react';
import { useQuery } from 'react-fetching-library';

import { Operations } from '../../generated/OpenapiInternal';
import { EventType } from '../../types/Notifications';

interface InstantEmailCellProps {
    eventType: EventType;
}

const useInstantEmailByEventType = (id: string) => {
    const query = useQuery(Operations.TemplateResourceGetInstantEmailTemplates.actionCreator({
        eventTypeId: id
    }));

    return query;
};

export const InstantEmailCell: React.FunctionComponent<InstantEmailCellProps> = props => {
    const instantEmail = useInstantEmailByEventType(props.eventType.id);

    if (instantEmail.loading) {
        return <Spinner />;
    }

    return <>
        { instantEmail.payload?.status === 200 ? 'Template found' : 'No template' }
    </>;
};
