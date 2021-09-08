package com.redhat.cloud.notifications.routers;

import com.redhat.cloud.notifications.MockServerClientConfig;
import com.redhat.cloud.notifications.MockServerClientConfig.RbacAccess;
import com.redhat.cloud.notifications.MockServerConfig;
import com.redhat.cloud.notifications.TestConstants;
import com.redhat.cloud.notifications.TestHelpers;
import com.redhat.cloud.notifications.TestLifecycleManager;
import com.redhat.cloud.notifications.db.ApplicationResources;
import com.redhat.cloud.notifications.db.BehaviorGroupResources;
import com.redhat.cloud.notifications.db.DbIsolatedTest;
import com.redhat.cloud.notifications.db.ResourceHelpers;
import com.redhat.cloud.notifications.models.Application;
import com.redhat.cloud.notifications.models.BehaviorGroup;
import com.redhat.cloud.notifications.models.EventType;
import com.redhat.cloud.notifications.routers.models.Facet;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import io.restassured.http.Header;
import io.restassured.response.Response;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;
import static io.restassured.http.ContentType.TEXT;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
@QuarkusTestResource(TestLifecycleManager.class)
public class NotificationServiceTest extends DbIsolatedTest {

    /*
     * In the tests below, most JSON responses are verified using JsonObject/JsonArray instead of deserializing these
     * responses into model instances and checking their attributes values. That's because the model classes contain
     * attributes annotated with @JsonProperty(access = READ_ONLY) which can't be deserialized and therefore verified
     * here. The deserialization is still performed only to verify that the JSON responses data structure is correct.
     */

    private static final String TENANT = "NotificationServiceTest";
    private static final String USERNAME = "user";

    @MockServerConfig
    MockServerClientConfig mockServerConfig;

    @Inject
    ResourceHelpers helpers;

    @Inject
    ApplicationResources applicationResources;

    @Inject
    BehaviorGroupResources behaviorGroupResources;

    @BeforeEach
    void beforeEach() {
        RestAssured.basePath = TestConstants.API_NOTIFICATIONS_V_1_0;
        mockServerConfig.clearRbac();
    }

    private Header initRbacMock(String tenant, String username, RbacAccess access) {
        String identityHeaderValue = TestHelpers.encodeIdentityInfo(tenant, username);
        mockServerConfig.addMockRbacAccess(identityHeaderValue, access);
        return TestHelpers.createIdentityHeader(identityHeaderValue);
    }

    @Test
    void testEventTypeFetching() {
        helpers.createTestAppAndEventTypes()
                .await().indefinitely();
        Header identityHeader = initRbacMock(TENANT, USERNAME, RbacAccess.FULL_ACCESS);

        Response response = given()
                .when()
                .header(identityHeader)
                .get("/notifications/eventTypes")
                .then()
                .statusCode(200)
                .contentType(JSON)
                .extract().response();

        JsonArray eventTypes = new JsonArray(response.getBody().asString());
        assertEquals(201, eventTypes.size()); // One of the event types is part of the default DB records.

        JsonObject policiesAll = eventTypes.getJsonObject(0);
        policiesAll.mapTo(EventType.class);
        assertNotNull(policiesAll.getString("id"));
        assertNotNull(policiesAll.getJsonObject("application"));
        assertNotNull(policiesAll.getJsonObject("application").getString("id"));
    }

    @Test
    void testEventTypeFetchingByApplication() {
        helpers.createTestAppAndEventTypes()
                .await().indefinitely();
        Header identityHeader = initRbacMock(TENANT, USERNAME, RbacAccess.FULL_ACCESS);

        List<Application> applications = applicationResources.getApplications(ResourceHelpers.TEST_BUNDLE_NAME)
                .await().indefinitely();
        UUID myOtherTesterApplicationId = applications.stream().filter(a -> a.getName().equals(ResourceHelpers.TEST_APP_NAME_2)).findFirst().get().getId();

        Response response = given()
                .when()
                .header(identityHeader)
                .queryParam("applicationIds", myOtherTesterApplicationId)
                .get("/notifications/eventTypes")
                .then()
                .statusCode(200)
                .contentType(JSON)
                .extract().response();

        JsonArray eventTypes = new JsonArray(response.getBody().asString());
        for (int i = 0; i < eventTypes.size(); i++) {
            JsonObject ev = eventTypes.getJsonObject(i);
            ev.mapTo(EventType.class);
            assertEquals(myOtherTesterApplicationId.toString(), ev.getJsonObject("application").getString("id"));
        }

        assertEquals(100, eventTypes.size());
    }

    @Test
    void testEventTypeFetchingByBundle() {
        helpers.createTestAppAndEventTypes()
                .await().indefinitely();
        Header identityHeader = initRbacMock(TENANT, USERNAME, RbacAccess.FULL_ACCESS);

        List<Application> applications = applicationResources.getApplications(ResourceHelpers.TEST_BUNDLE_NAME)
                .await().indefinitely();
        UUID myBundleId = applications.stream().filter(a -> a.getName().equals(helpers.TEST_APP_NAME_2)).findFirst().get().getBundleId();

        Response response = given()
                .when()
                .header(identityHeader)
                .queryParam("bundleId", myBundleId)
                .get("/notifications/eventTypes")
                .then()
                .statusCode(200)
                .contentType(JSON)
                .extract().response();

        JsonArray eventTypes = new JsonArray(response.getBody().asString());
        for (int i = 0; i < eventTypes.size(); i++) {
            JsonObject ev = eventTypes.getJsonObject(i);
            ev.mapTo(EventType.class);
            assertEquals(myBundleId.toString(), ev.getJsonObject("application").getString("bundle_id"));
        }

        assertEquals(200, eventTypes.size());
    }

    @Test
    void testEventTypeFetchingByBundleAndApplicationId() {
        helpers.createTestAppAndEventTypes()
                .await().indefinitely();
        Header identityHeader = initRbacMock(TENANT, USERNAME, RbacAccess.FULL_ACCESS);

        List<Application> applications = applicationResources.getApplications(ResourceHelpers.TEST_BUNDLE_NAME)
                .await().indefinitely();
        UUID myOtherTesterApplicationId = applications.stream().filter(a -> a.getName().equals(helpers.TEST_APP_NAME_2)).findFirst().get().getId();
        UUID myBundleId = applications.stream().filter(a -> a.getName().equals(helpers.TEST_APP_NAME_2)).findFirst().get().getBundleId();

        Response response = given()
                .when()
                .header(identityHeader)
                .queryParam("bundleId", myBundleId)
                .queryParam("applicationIds", myOtherTesterApplicationId)
                .get("/notifications/eventTypes")
                .then()
                .statusCode(200)
                .contentType(JSON)
                .extract().response();

        JsonArray eventTypes = new JsonArray(response.getBody().asString());
        for (int i = 0; i < eventTypes.size(); i++) {
            JsonObject ev = eventTypes.getJsonObject(i);
            ev.mapTo(EventType.class);
            assertEquals(myBundleId.toString(), ev.getJsonObject("application").getString("bundle_id"));
            assertEquals(myOtherTesterApplicationId.toString(), ev.getJsonObject("application").getString("id"));
        }

        assertEquals(100, eventTypes.size());
    }

    @Test
    void testGetEventTypesAffectedByEndpoint() {
        UUID bundleId = helpers.createTestAppAndEventTypes()
                .await().indefinitely();
        String tenant = "testGetEventTypesAffectedByEndpoint";
        Header identityHeader = initRbacMock(tenant, "user", RbacAccess.FULL_ACCESS);

        UUID behaviorGroupId1 = helpers.createBehaviorGroup(tenant, "behavior-group-1", bundleId)
                .onItem().transform(BehaviorGroup::getId)
                .await().indefinitely();
        UUID behaviorGroupId2 = helpers.createBehaviorGroup(tenant, "behavior-group-2", bundleId)
                .onItem().transform(BehaviorGroup::getId)
                .await().indefinitely();
        UUID applicationId = applicationResources.getApplications(ResourceHelpers.TEST_BUNDLE_NAME)
                .await().indefinitely()
                .stream().filter(a -> a.getName().equals(ResourceHelpers.TEST_APP_NAME_2)).findFirst().get().getId();
        UUID ep1 = helpers.createWebhookEndpoint(tenant)
                .await().indefinitely();
        UUID ep2 = helpers.createWebhookEndpoint(tenant)
                .await().indefinitely();
        List<EventType> eventTypesFromApp1 = applicationResources.getEventTypes(applicationId)
                .await().indefinitely();
        EventType ev0 = eventTypesFromApp1.get(0);
        EventType ev1 = eventTypesFromApp1.get(1);

        // ep1 assigned to ev0; ep2 not assigned.
        behaviorGroupResources.updateEventTypeBehaviors(tenant, ev0.getId(), Set.of(behaviorGroupId1))
                .await().indefinitely();
        behaviorGroupResources.updateBehaviorGroupActions(tenant, behaviorGroupId1, List.of(ep1))
                .await().indefinitely();
        String responseBody = given()
                .header(identityHeader)
                .pathParam("endpointId", ep1.toString())
                .when()
                .get("/notifications/behaviorGroups/affectedByRemovalOfEndpoint/{endpointId}")
                .then()
                .statusCode(200)
                .contentType(JSON)
                .extract().asString();

        JsonArray behaviorGroups = new JsonArray(responseBody);
        assertEquals(1, behaviorGroups.size());
        behaviorGroups.getJsonObject(0).mapTo(BehaviorGroup.class);
        assertEquals(behaviorGroupId1.toString(), behaviorGroups.getJsonObject(0).getString("id"));

        responseBody = given()
                .header(identityHeader)
                .pathParam("endpointId", ep2.toString())
                .when()
                .get("/notifications/behaviorGroups/affectedByRemovalOfEndpoint/{endpointId}")
                .then()
                .statusCode(200)
                .contentType(JSON)
                .extract().asString();

        behaviorGroups = new JsonArray(responseBody);
        assertEquals(0, behaviorGroups.size());

        // ep1 assigned to event ev0; ep2 assigned to event ev1
        behaviorGroupResources.updateEventTypeBehaviors(tenant, ev1.getId(), Set.of(behaviorGroupId2))
                .await().indefinitely();
        behaviorGroupResources.updateBehaviorGroupActions(tenant, behaviorGroupId2, List.of(ep2))
                .await().indefinitely();
        responseBody = given()
                .header(identityHeader)
                .pathParam("endpointId", ep1.toString())
                .when()
                .get("/notifications/behaviorGroups/affectedByRemovalOfEndpoint/{endpointId}")
                .then()
                .statusCode(200)
                .contentType(JSON)
                .extract().asString();

        behaviorGroups = new JsonArray(responseBody);
        assertEquals(1, behaviorGroups.size());
        behaviorGroups.getJsonObject(0).mapTo(BehaviorGroup.class);
        assertEquals(behaviorGroupId1.toString(), behaviorGroups.getJsonObject(0).getString("id"));

        responseBody = given()
                .header(identityHeader)
                .pathParam("endpointId", ep2.toString())
                .when()
                .get("/notifications/behaviorGroups/affectedByRemovalOfEndpoint/{endpointId}")
                .then()
                .statusCode(200)
                .contentType(JSON)
                .extract().asString();

        behaviorGroups = new JsonArray(responseBody);
        assertEquals(1, behaviorGroups.size());
        behaviorGroups.getJsonObject(0).mapTo(BehaviorGroup.class);
        assertEquals(behaviorGroupId2.toString(), behaviorGroups.getJsonObject(0).getString("id"));
    }

    @Test
    void testGetApplicationFacets() {
        Header identityHeader = initRbacMock("test", "user", RbacAccess.READ_ACCESS);
        List<Facet> applications = given()
                .header(identityHeader)
                .when()
                .get("/notifications/facets/applications?bundleName=rhel")
                .then()
                .statusCode(200).contentType(JSON).extract().response().jsonPath().getList(".", Facet.class);

        assertTrue(applications.size() > 0);
        Optional<Facet> policies = applications.stream().filter(facet -> facet.getName().equals("policies")).findFirst();
        assertTrue(policies.isPresent());
        assertEquals("Policies", policies.get().getDisplayName());

        // Without bundle returns all applications across bundles
        applications = given()
                .header(identityHeader)
                .when()
                .get("/notifications/facets/applications")
                .then()
                .statusCode(200).contentType(JSON).extract().response().jsonPath().getList(".", Facet.class);

        assertTrue(applications.size() > 0);
        policies = applications.stream().filter(facet -> facet.getName().equals("policies")).findFirst();
        assertTrue(policies.isPresent());
        assertEquals("Policies", policies.get().getDisplayName());
    }

    @Test
    void testGetBundlesFacets() {
        Header identityHeader = initRbacMock("test", "user", RbacAccess.READ_ACCESS);
        List<Facet> bundles = given()
                .header(identityHeader)
                .when()
                .contentType(JSON)
                .get("/notifications/facets/bundles")
                .then()
                .statusCode(200).contentType(JSON).extract().response().jsonPath().getList(".", Facet.class);

        assertTrue(bundles.size() > 0);
        Optional<Facet> rhel = bundles.stream().filter(facet -> facet.getName().equals("rhel")).findFirst();
        assertTrue(rhel.isPresent());
        assertEquals("Red Hat Enterprise Linux", rhel.get().getDisplayName());
    }

    @Test
    void testInsufficientPrivileges() {
        Header noAccessIdentityHeader = initRbacMock("tenant", "noAccess", RbacAccess.NO_ACCESS);
        Header readAccessIdentityHeader = initRbacMock("tenant", "readAccess", RbacAccess.READ_ACCESS);

        given()
                .header(noAccessIdentityHeader)
                .when()
                .get("/notifications/eventTypes")
                .then()
                .statusCode(403)
                .contentType(JSON);

        given()
                .header(noAccessIdentityHeader)
                .pathParam("behaviorGroupId", UUID.randomUUID())
                .when()
                .get("/notifications/eventTypes/affectedByRemovalOfBehaviorGroup/{behaviorGroupId}")
                .then()
                .statusCode(403)
                .contentType(JSON);

        given()
                .header(noAccessIdentityHeader)
                .pathParam("endpointId", UUID.randomUUID())
                .when()
                .get("/notifications/behaviorGroups/affectedByRemovalOfEndpoint/{endpointId}")
                .then()
                .statusCode(403)
                .contentType(JSON);

        given()
                .header(readAccessIdentityHeader)
                .contentType(JSON)
                .pathParam("eventTypeId", UUID.randomUUID())
                .body(Json.encode(List.of(UUID.randomUUID())))
                .when()
                .put("/notifications/eventTypes/{eventTypeId}/behaviorGroups")
                .then()
                .statusCode(403)
                .contentType(TEXT);

        given()
                .header(noAccessIdentityHeader)
                .pathParam("eventTypeId", UUID.randomUUID())
                .when()
                .get("/notifications/eventTypes/{eventTypeId}/behaviorGroups")
                .then()
                .statusCode(403)
                .contentType(JSON);

        given()
                .header(readAccessIdentityHeader)
                .contentType(JSON)
                // TODO Remove the body when https://github.com/quarkusio/quarkus/issues/16897 is fixed
                .body(Json.encode(new BehaviorGroup()))
                .when()
                .post("/notifications/behaviorGroups")
                .then()
                .statusCode(403)
                .contentType(JSON);

        given()
                .header(readAccessIdentityHeader)
                .contentType(JSON)
                .pathParam("id", UUID.randomUUID())
                // TODO Remove the body when https://github.com/quarkusio/quarkus/issues/16897 is fixed
                .body(Json.encode(new BehaviorGroup()))
                .when()
                .put("/notifications/behaviorGroups/{id}")
                .then()
                .statusCode(403)
                .contentType(JSON);

        given()
                .header(readAccessIdentityHeader)
                .pathParam("id", UUID.randomUUID())
                .when()
                .delete("/notifications/behaviorGroups/{id}")
                .then()
                .statusCode(403)
                .contentType(JSON);

        given()
                .header(readAccessIdentityHeader)
                .contentType(JSON)
                .pathParam("behaviorGroupId", UUID.randomUUID())
                .body(Json.encode(List.of(UUID.randomUUID())))
                .when()
                .put("/notifications/behaviorGroups/{behaviorGroupId}/actions")
                .then()
                .statusCode(403)
                .contentType(TEXT);

        given()
                .header(noAccessIdentityHeader)
                .pathParam("bundleId", UUID.randomUUID())
                .when()
                .get("/notifications/bundles/{bundleId}/behaviorGroups")
                .then()
                .statusCode(403)
                .contentType(JSON);
    }
}
