import { useRef } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";
import { sendQrCode, textQrCode } from "~/models/aws.server";

import {
  deleteChild,
  getChild,
  updateChild,
} from "~/models/registration.server";
import { requireUserId } from "~/session.server";
import ReactToPrint from "react-to-print";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.registrantId, "Child not found");

  const child = await getChild(params.registrantId);
  if (!child) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ child });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.registrantId, "Child not found");

  const formData = await request.formData();
  const action = formData.get("_action");
  const phone = formData.get("phone")?.toString() || "";
  const name = formData.get("registrant")?.toString() || "";
  const qrcode = formData.get("qrcode")?.toString() || "";
  const email = formData.get("email")?.toString() || "";

  if (action === "deleteChild") {
    await deleteChild(params.registrantId);
    return redirect("/registrants");
  } else if (action === "sendQrCode") {
    await sendQrCode(email);
    return { status: 200, message: "QR Code sent" };
  } else if (action === "textQrCode") {
    await textQrCode(phone);
    return { status: 200, message: "QR Code sent" };
  } else if (action === "updateChildStatus") {
    const child = await getChild(params.registrantId);
    if (child && child?.checkedIn === false) {
      await updateChild(
        child.id,
        child.name,
        child.age,
        child.grade,
        child.userId,
        child.medical,
        qrcode,
        child.picPermission,
        child.tshirtSize,
        child.transportation,
        child.emergencyContactName,
        child.emergencyContactPhone,
        true
      );
      return { status: 200, message: "Child checked in" };
    } else if (child && child?.checkedIn === true) {
      await updateChild(
        child.id,
        child.name,
        child.age,
        child.grade,
        child.userId,
        child.medical,
        qrcode,
        child.picPermission,
        child.tshirtSize,
        child.transportation,
        child.emergencyContactName,
        child.emergencyContactPhone,
        false
      );
      return { status: 200, message: "Child checked out" };
    }
  }
};

export default function ChildDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData();

  const componentRef = useRef();

  const child = data.child;
  const PrintComponent = React.forwardRef((props, ref) => {
    const currentDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
    return (
      <div ref={ref} className="bg-white w-96 min-h-156 z-50 overflow-y-auto">
        <div className="m-4 border-2">
          <div className="text-left">
            <div>
              <div className="text-center">
                <p className="text-2xl font-bold">{child.name}</p>
                <p className="text-sm text-gray-500">{currentDate}</p>
                <hr />
              </div>
              <div className="mx-4 text-xl">
                <br />
                <p>Parent: {child.emergencyContactName}</p>
                <p>Phone: {child.emergencyContactPhone}</p>
                <p>Age: {child.age}</p>
                <p>Medical: {child.medical}</p>
                <br />
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (

    <div className="m-8">
      <h3 className="text-2xl font-bold">{data.child.name}</h3>
      <p className="py-2">Age: {data.child.age}</p>
      <p className="py-2">Parent: {child.emergencyContactName}</p>
      <p className="py-2">Phone: {child.emergencyContactPhone}</p>
      <p className="py-2">
        Medical concerns / Allergies:{" "}
        {data.child.medical ? data.child.medical : "none"}
      </p>

      {actionData &&
        (actionData.status === 200 ? (
          <div
            className="relative rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700"
            role="alert"
          >
            <span className="block sm:inline">{actionData.message}</span>
          </div>
        ) : (
          <div
            className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
            role="alert"
          >
            <span className="block sm:inline">{actionData.message}</span>
          </div>
        ))}
      {/* <div className="mx-auto my-4 w-full pb-1">
        <img src={data.child.qrcode} alt={"child qr code"} />
      </div> */}

      <hr className="my-4" />
      <div className="flex flex-wrap">
        <Link
          to={`/registrants/${data.child.id}-edit`}
          className="m-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Edit
        </Link>

        {/* <Form method="post">
          <input type="hidden" name="registrantId" value={data.child.id} />
          <input type="hidden" name="qrcode" value={data.child.qrcode} />
          <button
            type="submit"
            name="_action"
            value="updateChildStatus"
            className="m-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            {data.child.checkedIn === true ? "Check Out" : "Check In"}
          </button>
        </Form>
        <Form method="post">
          <input type="hidden" name="registrantId" value={data.child.id} />
          <input type="hidden" name="registrant" value={data.child.name} />
          <input type="hidden" name="qrcode" value={data.child.qrcode} />
          <input type="hidden" name="email" value={data.child.user.email} />
          <input type="hidden" name="phone" value={data.child.user.phone} />
          <button
            type="submit"
            name="_action"
            value="sendQrCode"
            className="m-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Email QR Code
          </button>
          <button
            type="submit"
            name="_action"
            value="textQrCode"
            className="m-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Text QR Code
          </button>
        </Form> */}
        {/* <Form method="post">
          <input type="hidden" name="phone" value={data.child.phone} />
          <input
            type="hidden"
            name="registrant"
            value={data.child.registrant}
          />
          <button
            type="submit"
            name="_action"
            value="textQrCode"
            className="mx-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Text QR Code
          </button>
        </Form> */}
        <Form method="post">
          <button
            type="submit"
            name="_action"
            value="deleteChild"
            className="m-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
          >
            Delete
          </button>
        </Form>
      </div>

      <div>
        <ReactToPrint
          trigger={() => <button className="m-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >Print
          </button>}
          content={() => componentRef.current}
        />
        <div className="mt-2 text-xl italic text-bold">Label Preview:</div>
        <PrintComponent ref={componentRef} />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Registrant not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
