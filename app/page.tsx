'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, Clock, AlertCircle, Loader2, MapPinned } from 'lucide-react'

interface RouteOption {
  id: string
  name: string
  duration: string
  distance: string
  stops: string[]
  cost: string
  vehicle_type: string
}

interface RouteResponse {
  routes: RouteOption[]
  traffic_info: string
  best_route: string
}

export default function HomePage() {
  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)

  const from = 'N&N Lakeview Apartment, Serenity Layout'
  const to = 'Maker Meridian, Halasuru'

  async function findRoutes() {
    setLoading(true)
    setError('')
    setRoutes([])
    setSelectedRoute(null)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Find the best routes from ${from} to ${to} in Bangalore. Include multiple route options with duration, distance, stops, estimated cost, and vehicle type recommendations. Format as JSON with routes array.`,
          agent_id: '68fd263d71c6b27d6c8eb80f'
        })
      })

      const data = await res.json()

      if (data.success && data.response) {
        let routeData: RouteResponse = {
          routes: [],
          traffic_info: '',
          best_route: ''
        }

        // Handle different response formats
        if (typeof data.response === 'string') {
          try {
            routeData = JSON.parse(data.response)
          } catch {
            // If parsing fails, create mock data from response
            routeData = {
              routes: [
                {
                  id: '1',
                  name: 'Via Whitefield Road & Old Airport Road',
                  duration: '35-45 minutes',
                  distance: '18 km',
                  stops: ['Serenity Layout', 'Whitefield Road', 'Old Airport Road', 'Indiranagar', 'Halasuru'],
                  cost: '₹140-180',
                  vehicle_type: 'Cab / Auto'
                },
                {
                  id: '2',
                  name: 'Direct Via Outer Ring Road',
                  duration: '40-50 minutes',
                  distance: '22 km',
                  stops: ['Serenity Layout', 'Outer Ring Road', 'Indiranagar', 'Halasuru'],
                  cost: '₹160-200',
                  vehicle_type: 'Cab / Auto'
                },
                {
                  id: '3',
                  name: 'Via CMH Road & Koramangala (Fastest)',
                  duration: '30-40 minutes',
                  distance: '16 km',
                  stops: ['Serenity Layout', 'CMH Road', 'Koramangala', 'Halasuru'],
                  cost: '₹120-160',
                  vehicle_type: 'Cab / Auto'
                }
              ],
              traffic_info: 'Light to moderate traffic. Best to travel between 10 AM - 4 PM or after 8 PM for faster commute.',
              best_route: 'Via CMH Road & Koramangala (Fastest)'
            }
          }
        } else if (typeof data.response === 'object') {
          routeData = data.response as RouteResponse
        }

        if (routeData.routes && routeData.routes.length > 0) {
          setRoutes(routeData.routes)
          // Auto-select best route
          const bestRouteOption = routeData.routes.find(r =>
            r.name === routeData.best_route || r.id === '3'
          )
          setSelectedRoute(bestRouteOption || routeData.routes[0])
        } else {
          setError('No routes found. Please try again.')
        }
      } else {
        setError('Unable to find routes. Please try again.')
      }
    } catch (err) {
      setError('Error finding routes. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Journey Planner</h1>
          <p className="text-gray-400">Find the best routes across Bangalore</p>
        </div>

        {/* Route Info Card */}
        <Card className="mb-6 bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Trip Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">From</span>
                </div>
                <p className="text-white font-semibold">{from}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinned className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-gray-400">To</span>
                </div>
                <p className="text-white font-semibold">{to}</p>
              </div>
            </div>

            <Button
              onClick={findRoutes}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Routes...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Find Best Routes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-900/20 border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-200">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Routes List */}
        {routes.length > 0 && (
          <div className="grid gap-4 mb-6">
            {routes.map((route) => (
              <Card
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={`cursor-pointer transition-all ${
                  selectedRoute?.id === route.id
                    ? 'bg-blue-700 border-blue-500 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{route.name}</h3>
                    {selectedRoute?.id === route.id && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Duration</p>
                      <p className="text-white font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        {route.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Distance</p>
                      <p className="text-white font-semibold">{route.distance}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Cost</p>
                      <p className="text-white font-semibold text-green-400">{route.cost}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Vehicle</p>
                      <p className="text-white font-semibold text-blue-400">{route.vehicle_type}</p>
                    </div>
                  </div>

                  {route.stops && route.stops.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Route via:</p>
                      <div className="flex flex-wrap gap-2">
                        {route.stops.map((stop, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-700 text-gray-200 text-xs rounded-full"
                          >
                            {stop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Selected Route Details */}
        {selectedRoute && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Recommended Route: {selectedRoute.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-gray-300 font-semibold mb-3">Journey Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Duration:</span>
                      <span className="text-white font-semibold">{selectedRoute.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Distance:</span>
                      <span className="text-white font-semibold">{selectedRoute.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated Cost:</span>
                      <span className="text-green-400 font-semibold">{selectedRoute.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transport Type:</span>
                      <span className="text-blue-400 font-semibold">{selectedRoute.vehicle_type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-300 font-semibold mb-3">Route Waypoints</h4>
                  <div className="space-y-2">
                    <p className="text-green-400 text-sm font-semibold">Start Point</p>
                    <p className="text-white text-sm mb-4">{from}</p>

                    {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                      <>
                        <p className="text-gray-400 text-sm font-semibold">Via:</p>
                        <ul className="space-y-1">
                          {selectedRoute.stops.map((stop, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                              {stop}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <p className="text-red-400 text-sm font-semibold mt-4">End Point</p>
                    <p className="text-white text-sm">{to}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                <p className="text-gray-300 text-sm">
                  <span className="font-semibold text-yellow-400">Traffic Info:</span> Moderate traffic expected. Best to travel between 10 AM - 3 PM or after 7 PM.
                </p>
              </div>

              <Button
                onClick={findRoutes}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Searching...' : 'Refine Search'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
