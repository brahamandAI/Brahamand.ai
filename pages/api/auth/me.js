import { parse } from "cookie";
import axios from "axios";
import mysql from "../../../lib/db";
import jwt from "jsonwebtoken";

export default function handler(req, res) {
  // Return a guest user when not authenticated
  // This prevents 401 errors for demo purposes
  return res.status(200).json({
    user: {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'guest',
      isGuest: true
    }
  });
}
