import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const runtime = 'nodejs';

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive is not configured yet.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

export async function POST(request) {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json({ ok: false, error: 'Missing GOOGLE_DRIVE_FOLDER_ID.' }, { status: 500 });
    }

    const formData = await request.formData();

    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const address = formData.get('address') || '';
    const telegram = formData.get('telegram') || '';
    const contact = formData.get('contact') || '';
    const locationLabel = formData.get('locationLabel') || '';
    const shippingFee = formData.get('shippingFee') || '0';
    const adminFee = formData.get('adminFee') || '0';
    const subtotal = formData.get('subtotal') || '0';
    const total = formData.get('total') || '0';
    const itemsRaw = formData.get('items') || '[]';
    const file = formData.get('screenshot');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'No screenshot was uploaded.' }, { status: 400 });
    }

    let items = [];
    try {
      items = JSON.parse(itemsRaw);
    } catch (e) {
      items = [];
    }

    const itemsSummary = items.map((i) => `${i.name} x${i.qty} (₱${i.price} each)`).join('; ');

    const description = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Shipping address: ${address}`,
      `Telegram: ${telegram}`,
      `Contact number: ${contact}`,
      `Shipping location: ${locationLabel} (₱${shippingFee})`,
      `Items: ${itemsSummary}`,
      `Subtotal: ₱${subtotal}`,
      `Admin fee: ₱${adminFee}`,
      `Total: ₱${total}`,
      `Submitted: ${new Date().toISOString()}`,
    ].join('\n');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    const safeName = name.toString().trim().replace(/[^a-z0-9\- ]/gi, '').slice(0, 40) || 'order';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : 'jpg';
    const driveFileName = `${safeName}_${timestamp}.${extension}`;

    const drive = getDriveClient();

    const uploadRes = await drive.files.create({
      requestBody: {
        name: driveFileName,
        parents: [folderId],
        description,
      },
      media: {
        mimeType: file.type || 'image/jpeg',
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    return NextResponse.json({ ok: true, fileId: uploadRes.data.id });
  } catch (err) {
    console.error('Checkout upload failed:', err);
    return NextResponse.json(
      { ok: false, error: 'Could not submit your order right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
