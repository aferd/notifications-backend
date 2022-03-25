import { CodeEditor, Language } from '@patternfly/react-code-editor';
import {
    PageSection,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Title
} from '@patternfly/react-core';
import * as React from 'react';

export const EmailTemplatePage: React.FunctionComponent = () => {

    return (
        <>
            <PageSection>
                <Split>
                    <SplitItem isFilled>
                        <Title headingLevel="h1" >Email templates</Title>
                    </SplitItem>
                </Split>
            </PageSection>
            <PageSection>
                <Stack>
                    <StackItem>
                        <Title headingLevel="h2">Result</Title>
                    </StackItem>
                </Stack>
            </PageSection>
            <PageSection>
                <Title headingLevel="h2">Subject template</Title>
                <CodeEditor
                    isLineNumbersVisible
                    isMinimapVisible={ false }
                    height="50px"
                />
            </PageSection>
            <PageSection>
                <Title headingLevel="h2">Body template</Title>
                <CodeEditor
                    isLineNumbersVisible
                    isMinimapVisible={ false }
                    height="300px"
                />
            </PageSection>
            <PageSection>
                <Title headingLevel="h2">Payload</Title>
                <CodeEditor
                    isLineNumbersVisible
                    isMinimapVisible={ false }
                    height="300px"
                    isLanguageLabelVisible
                    language={ Language.json }
                />
            </PageSection>
        </>
    );
};