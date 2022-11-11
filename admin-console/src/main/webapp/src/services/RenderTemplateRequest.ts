import { useMutation } from 'react-fetching-library';

import { Operations } from '../generated/OpenapiInternal';

export type RenderTemplateRequest = {
    payload: string;
    template: string;
}

const actionCreator = (params: RenderTemplateRequest) => Operations.TemplateResourceRenderEmailTemplate.actionCreator({
    body: {
        template: [ params.template ],
        payload: params.payload
    }
});

export const useRenderTemplateRequest = () => {
    return useMutation(actionCreator);
};
