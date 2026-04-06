import { NextResponse } from 'next/server';
import { ProviderHealthService } from '../../../../services/provider-health.service';

export async function GET() {
  try {
    const results = await ProviderHealthService.testAllProviders();
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { provider } = await req.json();
    if (!provider) {
       const results = await ProviderHealthService.testAllProviders();
       return NextResponse.json({ success: true, results });
    }
    const result = await ProviderHealthService.testSingle(provider);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
