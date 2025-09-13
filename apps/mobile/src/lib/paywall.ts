import Constants from 'expo-constants'
import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL, PurchasesOffering, CustomerInfo } from 'react-native-purchases'

const extra: any = Constants.expoConfig?.extra || {}

function rcKey(): string | undefined {
  return Platform.OS === 'ios' ? (extra.EXPO_PUBLIC_RC_IOS_KEY as string) : (extra.EXPO_PUBLIC_RC_ANDROID_KEY as string)
}

function entitlementId(): string {
  return (extra.EXPO_PUBLIC_RC_ENTITLEMENT as string) || 'pro'
}

export async function setupPurchases(userId?: string) {
  try {
    const key = rcKey()
    if (!key) return
    Purchases.setLogLevel(LOG_LEVEL.WARN)
    // v7 configure accepts object
    // @ts-ignore types may differ per version
    await Purchases.configure({ apiKey: key, appUserID: userId })
  } catch {}
}

export async function checkPro(): Promise<boolean> {
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo()
    return !!info.entitlements.active[entitlementId()]
  } catch {
    return !!extra.EXPO_PUBLIC_DEV_PRO
  }
}

export async function purchasePro(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings()
    const offering: PurchasesOffering | undefined = offerings.current || Object.values(offerings.all)[0]
    const pkg = offering?.availablePackages?.[0]
    if (!pkg) throw new Error('No packages available')
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return !!customerInfo.entitlements.active[entitlementId()]
  } catch {
    return false
  }
}

export async function restorePro(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases()
    return !!info.entitlements.active[entitlementId()]
  } catch {
    return false
  }
}
