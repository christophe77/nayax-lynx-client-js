import { describe, expect, it } from "vitest";
import { NayaxLynxClient } from "../../src/client.js";
import { makeFetchMock } from "../helpers/mock-fetch.js";

const BASE = "https://qa-lynx.nayax.com/operational";

function build(queue: Parameters<typeof makeFetchMock>[0]) {
  const { fetch, calls } = makeFetchMock(queue);
  const client = new NayaxLynxClient({
    environment: "qa",
    auth: { type: "static", token: "T" },
    fetch,
    retry: { maxRetries: 0, initialDelayMs: 1, maxDelayMs: 1, jitter: 0, factor: 1 },
  });
  return { client, calls };
}

interface Case {
  name: string;
  call: (c: NayaxLynxClient) => Promise<unknown>;
  expectedUrl: string;
  expectedMethod?: string;
  expectedBody?: unknown;
}

const schedulingCases: Case[] = [
  // Drivers
  {
    name: "scheduling.listDrivers (no filters)",
    call: (c) => c.scheduling.listDrivers(),
    expectedUrl: `${BASE}/v1/Scheduling/drivers`,
  },
  {
    name: "scheduling.listDrivers (filtered)",
    call: (c) =>
      c.scheduling.listDrivers({ ActorId: 42, Search: "Jane", SearchByFullname: true }),
    expectedUrl: `${BASE}/v1/Scheduling/drivers?ActorId=42&Search=Jane&SearchByFullname=true`,
  },
  {
    name: "scheduling.addDriver",
    call: (c) =>
      c.scheduling.addDriver({ UserId: 100, OperatorId: 42, DriverLicense: "ABC123" }),
    expectedUrl: `${BASE}/v1/Scheduling/drivers`,
    expectedMethod: "POST",
    expectedBody: { UserId: 100, OperatorId: 42, DriverLicense: "ABC123" },
  },
  {
    name: "scheduling.updateDriver",
    call: (c) =>
      c.scheduling.updateDriver("550e8400-e29b-41d4-a716-446655440000", {
        UserId: 100,
        OperatorId: 42,
      }),
    expectedUrl: `${BASE}/v1/Scheduling/drivers?DriverId=550e8400-e29b-41d4-a716-446655440000`,
    expectedMethod: "PUT",
  },
  {
    name: "scheduling.deleteDriver",
    call: (c) => c.scheduling.deleteDriver("550e8400-e29b-41d4-a716-446655440000"),
    expectedUrl: `${BASE}/v1/Scheduling/drivers?DriverId=550e8400-e29b-41d4-a716-446655440000`,
    expectedMethod: "DELETE",
  },
  // Routes
  {
    name: "scheduling.listRoutes",
    call: (c) => c.scheduling.listRoutes({ OperatorId: 42 }),
    expectedUrl: `${BASE}/v1/Scheduling/routes?OperatorId=42`,
  },
  {
    name: "scheduling.createRoute",
    call: (c) =>
      c.scheduling.createRoute(42, {
        RouteName: "Downtown",
        RouteCode: "DT-1",
        DriverId: "550e8400-e29b-41d4-a716-446655440000",
        RouteStatusId: 1,
      }),
    expectedUrl: `${BASE}/v1/Scheduling/routes?OperatorId=42`,
    expectedMethod: "POST",
  },
  {
    name: "scheduling.updateRoute",
    call: (c) =>
      c.scheduling.updateRoute(7, {
        OperatorId: 42,
        DriverId: "550e8400-e29b-41d4-a716-446655440000",
        RouteStatusId: 1,
      }),
    expectedUrl: `${BASE}/v1/Scheduling/routes?routeId=7`,
    expectedMethod: "PUT",
  },
  // Route machines
  {
    name: "scheduling.getRouteMachines",
    call: (c) => c.scheduling.getRouteMachines({ RouteId: 7 }),
    expectedUrl: `${BASE}/v1/Scheduling/route-machines?RouteId=7`,
  },
  {
    name: "scheduling.getRouteMachines (with MachineId filter)",
    call: (c) => c.scheduling.getRouteMachines({ RouteId: 7, MachineId: 12345 }),
    expectedUrl: `${BASE}/v1/Scheduling/route-machines?RouteId=7&MachineId=12345`,
  },
  {
    name: "scheduling.assignMachinesToRoute",
    call: (c) => c.scheduling.assignMachinesToRoute(7, { MachineIds: [12345, 67890] }),
    expectedUrl: `${BASE}/v1/Scheduling/route-machines?RouteId=7`,
    expectedMethod: "POST",
    expectedBody: { MachineIds: [12345, 67890] },
  },
  {
    name: "scheduling.removeMachineFromRoute",
    call: (c) => c.scheduling.removeMachineFromRoute({ RouteId: 7, MachineId: 12345 }),
    expectedUrl: `${BASE}/v1/Scheduling/route-machines?RouteId=7&MachineId=12345`,
    expectedMethod: "DELETE",
  },
  // Visit orders
  {
    name: "scheduling.getVisitOrders",
    call: (c) => c.scheduling.getVisitOrders({ VisitDate: "2026-06-01T00:00:00Z" }),
    expectedUrl: `${BASE}/v1/Scheduling/schedule/visit-order?VisitDate=2026-06-01T00%3A00%3A00Z`,
  },
  {
    name: "scheduling.createVisitOrders",
    call: (c) =>
      c.scheduling.createVisitOrders([
        { MachineId: 12345, VisitDate: "2026-06-01T00:00:00Z", OrderKey: 1 },
      ]),
    expectedUrl: `${BASE}/v1/Scheduling/schedule/visit-order`,
    expectedMethod: "POST",
    expectedBody: [
      { MachineId: 12345, VisitDate: "2026-06-01T00:00:00Z", OrderKey: 1 },
    ],
  },
  // Machine tasks
  {
    name: "scheduling.getMachineTasks",
    call: (c) =>
      c.scheduling.getMachineTasks({
        StartDate: "2026-05-27T00:00:00Z",
        EndDate: "2026-06-27T00:00:00Z",
        TimePeriod: 31,
      }),
    expectedUrl: `${BASE}/v1/Scheduling/schedule/machine-tasks?StartDate=2026-05-27T00%3A00%3A00Z&EndDate=2026-06-27T00%3A00%3A00Z&TimePeriod=31`,
  },
  {
    name: "scheduling.createMachineTasks",
    call: (c) =>
      c.scheduling.createMachineTasks([
        {
          MachineId: 12345,
          StatusId: 1,
          GeneratePickList: false,
          ScheduleNextWorkingDay: false,
          TimezoneOffset: 1.0,
        },
      ]),
    expectedUrl: `${BASE}/v1/Scheduling/schedule/machine-tasks`,
    expectedMethod: "POST",
  },
  {
    name: "scheduling.updateMachineTasks",
    call: (c) =>
      c.scheduling.updateMachineTasks([
        {
          MachineId: 12345,
          SchedulingId: 1,
          StatusId: 2,
          GeneratePickList: false,
          ScheduleNextWorkingDay: false,
          TimezoneOffset: 1.0,
        },
      ]),
    expectedUrl: `${BASE}/v1/Scheduling/schedule/machine-tasks`,
    expectedMethod: "PUT",
  },
  {
    name: "scheduling.deleteMachineTasks (SchedulingIds joined by comma)",
    call: (c) =>
      c.scheduling.deleteMachineTasks({ SchedulingIds: [1, 2, 3], isStatic: false }),
    expectedUrl: `${BASE}/v1/Scheduling/schedule/machine-tasks?SchedulingIds=1%2C2%2C3&isStatic=false`,
    expectedMethod: "DELETE",
  },
];

const paymentCases: Case[] = [
  {
    name: "payment.requestRefund",
    call: (c) =>
      c.payment.requestRefund({
        RefundAmount: 3.5,
        RefundEmailList: "a@b.c",
        RefundReason: "wrong item",
        TransactionId: 999,
        SiteId: 12,
        MachineAuTime: "2026-05-27T08:00:00Z",
      }),
    expectedUrl: `${BASE}/v1/payment/refund-request`,
    expectedMethod: "POST",
  },
  {
    name: "payment.approveRefund",
    call: (c) =>
      c.payment.approveRefund({
        IsRefundedExternally: false,
        TransactionId: 999,
        SiteId: 12,
        MachineAuTime: "2026-05-27T08:00:00Z",
      }),
    expectedUrl: `${BASE}/v1/payment/refund-approve`,
    expectedMethod: "POST",
  },
  {
    name: "payment.declineRefund",
    call: (c) =>
      c.payment.declineRefund({
        DeclineReason: "no proof",
        TransactionId: 999,
        SiteId: 12,
        MachineAuTime: "2026-05-27T08:00:00Z",
      }),
    expectedUrl: `${BASE}/v1/payment/refund-decline`,
    expectedMethod: "POST",
  },
  {
    name: "payment.uploadRefundDocumentation",
    call: (c) =>
      c.payment.uploadRefundDocumentation({
        FileName: "receipt.pdf",
        FileData: "JVBERi0xLjQ=",
        TransactionId: 999,
        SiteId: 12,
        MachineAuTime: "2026-05-27T08:00:00Z",
      }),
    expectedUrl: `${BASE}/v1/payment/upload-refund`,
    expectedMethod: "POST",
  },
];

const reportsCases: Case[] = [
  {
    name: "reports.getAvailableWidgets (no filter)",
    call: (c) => c.reports.getAvailableWidgets(),
    expectedUrl: `${BASE}/v1/dashboard/widgets`,
  },
  {
    name: "reports.getAvailableWidgets (with screenTypeId)",
    call: (c) => c.reports.getAvailableWidgets({ screenTypeId: 1 }),
    expectedUrl: `${BASE}/v1/dashboard/widgets?screenTypeId=1`,
  },
  {
    name: "reports.retrieveWidgetData",
    call: (c) =>
      c.reports.retrieveWidgetData({
        ScreenTypeId: 1,
        WidgetTypeId: 100,
        EntityId: 42,
        Filters: [{ Name: "startDate", Value: "2026-05-01", Type: "Date" }],
      }),
    expectedUrl: `${BASE}/v1/dashboard/get-widget-data`,
    expectedMethod: "POST",
    expectedBody: {
      ScreenTypeId: 1,
      WidgetTypeId: 100,
      EntityId: 42,
      Filters: [{ Name: "startDate", Value: "2026-05-01", Type: "Date" }],
    },
  },
];

function runCases(group: string, cases: Case[]) {
  describe(group, () => {
    for (const tc of cases) {
      it(tc.name, async () => {
        const { client, calls } = build([{ status: 200, body: [] }]);
        await tc.call(client);
        expect(calls).toHaveLength(1);
        expect(calls[0]!.url).toBe(tc.expectedUrl);
        expect(calls[0]!.init.method ?? "GET").toBe(tc.expectedMethod ?? "GET");
        if (tc.expectedBody !== undefined) {
          expect(JSON.parse(calls[0]!.init.body as string)).toEqual(tc.expectedBody);
        }
      });
    }
  });
}

runCases("scheduling resource — 16 endpoints", schedulingCases);
runCases("payment resource — 4 endpoints", paymentCases);
runCases("reports resource — 2 endpoints", reportsCases);
