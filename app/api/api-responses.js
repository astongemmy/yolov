import { NextResponse } from "next/server";

export const success = (message, data) => {
  return NextResponse.json({
    status: true,
    message,
    data,
  }, { status: 200 });
};

export const notFound = (message) => {
  return NextResponse.json({
    status: false,
    data: null,
    message,
  }, { status: 400 });
};

export const serverError = (message) => {
  return NextResponse.json({
    status: false,
    data: null,
    message,
  }, { status: 500 });
}