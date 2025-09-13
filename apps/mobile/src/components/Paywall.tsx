import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, Modal, ActivityIndicator } from 'react-native'
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases'

export function Paywall({ open, onClose, onPurchased }: { open: boolean; onClose: () => void; onPurchased: () => void }) {
  const [loading, setLoading] = useState(true)
  const [offering, setOffering] = useState<PurchasesOffering | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    (async () => {
      setLoading(true); setError(null)
      try {
        const o = await Purchases.getOfferings()
        setOffering(o.current || Object.values(o.all)[0] || null)
      } catch (e: any) { setError(e?.message || String(e)) }
      finally { setLoading(false) }
    })()
  }, [open])

  async function onBuy(pkg: PurchasesPackage) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg)
      if (customerInfo) onPurchased()
    } catch (e) {}
  }

  return (
    <Modal visible={open} transparent animationType='fade'>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '90%', maxWidth: 480, backgroundColor: '#0b0c0f', borderColor: '#232530', borderWidth: 1, borderRadius: 12, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#e8e8ea', fontSize: 18, fontWeight: '600' }}>Go Pro</Text>
            <Pressable onPress={onClose}><Text style={{ color: '#e8e8ea', fontSize: 18 }}>×</Text></Pressable>
          </View>
          <Text style={{ color: '#c2c2c5', marginTop: 8 }}>Unlock deep spreads, exports, and reminders.</Text>
          {loading && <ActivityIndicator color="#9bb0ff" style={{ marginTop: 12 }} />}
          {error && <Text style={{ color: '#ff9ba6', marginTop: 8 }}>{error}</Text>}
          {!loading && offering && (
            <View style={{ marginTop: 12 }}>
              {offering.availablePackages.map((p) => (
                <Pressable key={p.identifier} onPress={() => onBuy(p)} style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#2a2d3a', marginBottom: 8 }}>
                  <Text style={{ color: '#e8e8ea', fontWeight: '600' }}>{p.product.title}</Text>
                  <Text style={{ color: '#c2c2c5' }}>{p.product.description}</Text>
                  <Text style={{ color: '#9bb0ff', marginTop: 6 }}>{(p.product as any).priceString || `$${p.product.price}`}</Text>
                </Pressable>
              ))}
              {offering.availablePackages.length === 0 && (
                <Text style={{ color: '#c2c2c5' }}>No packages available.</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

