"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getQuoteRequestById, updateQuoteRequestStatus, getProductById } from "@/lib/supabase"
import { ArrowLeft, Check, Clock, Mail, Phone, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface QuoteRequest {
  id: string
  name: string
  company: string
  email: string
  phone: string | null
  message: string | null
  budget: string | null
  timeline: string | null
  event_type: string | null
  customization: boolean | null
  branding: boolean | null
  packaging: boolean | null
  shortlisted_products: any
  status: string | null
  created_at: string | null
  updated_at: string | null
}

interface Product {
  id: string
  name: string
  price: number
  images: string[] | null
}

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quote, setQuote] = useState<QuoteRequest | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadQuote() {
      try {
        const quoteData = await getQuoteRequestById(params.id)
        if (!quoteData) {
          toast.error("Quote request not found")
          router.push("/dashboard/quotes")
          return
        }
        
        setQuote(quoteData)
        
        // Load shortlisted products
        if (quoteData.shortlisted_products && Array.isArray(quoteData.shortlisted_products)) {
          const productPromises = quoteData.shortlisted_products.map((productId: string) => 
            getProductById(productId)
          )
          
          const productData = await Promise.all(productPromises)
          setProducts(productData.filter(Boolean) as Product[])
        }
      } catch (error) {
        console.error("Error loading quote request:", error)
        toast.error("Failed to load quote request")
      } finally {
        setLoading(false)
      }
    }
    
    loadQuote()
  }, [params.id, router])

  const handleStatusUpdate = async (status: string) => {
    if (!quote) return
    
    setUpdating(true)
    try {
      const updated = await updateQuoteRequestStatus(quote.id, status)
      if (updated) {
        setQuote({ ...quote, status })
        toast.success(`Quote request marked as ${status}`)
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating quote status:", error)
      toast.error("An error occurred while updating status")
    } finally {
      setUpdating(false)
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get badge color based on status
  const getBadgeClass = (status: string | null) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case 'rejected':
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case 'in-progress':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case 'completed':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      default:
        return "bg-amber-100 text-amber-800 hover:bg-amber-100" // pending or any other status
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 relative">
        <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
        <div className="flex items-center">
          <Link href="/dashboard/quotes" className="mr-4">
            <Button className="rounded-full h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div>
            <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
            <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse mt-1" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-3 gap-4">
                    <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-5 w-full col-span-2 bg-neutral-200 rounded animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-24 w-full bg-neutral-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-8 w-full bg-neutral-200 rounded animate-pulse" />
                <div className="h-8 w-full bg-neutral-200 rounded animate-pulse" />
                <div className="h-8 w-full bg-neutral-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="space-y-8 relative">
        <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
        <div className="flex items-center">
          <Link href="/dashboard/quotes" className="mr-4">
            <Button className="rounded-full h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Quote Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested quote could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      <div className="pattern-dots pattern-opacity-10 pattern-secondary absolute inset-0 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Link href="/dashboard/quotes" className="mr-4">
            <Button className="rounded-full h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Quote Request</h1>
            <p className="text-muted-foreground mt-1">From {quote.name} at {quote.company}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <Badge className={getBadgeClass(quote.status)}>
            {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1) || "Pending"}
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{quote.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{quote.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{quote.email}</p>
                    <Link href={`mailto:${quote.email}`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Email</span>
                      </Button>
                    </Link>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{quote.phone || "Not provided"}</p>
                    {quote.phone && (
                      <Link href={`tel:${quote.phone}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                          <Phone className="h-4 w-4" />
                          <span className="sr-only">Call</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{quote.budget || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timeline</p>
                  <p className="font-medium">{quote.timeline || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <p className="font-medium">{quote.event_type || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Submitted</p>
                  <p className="font-medium">{formatDate(quote.created_at)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Customization</p>
                  <p className="font-medium">{quote.customization ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branding</p>
                  <p className="font-medium">{quote.branding ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Custom Packaging</p>
                  <p className="font-medium">{quote.packaging ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {quote.message && (
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{quote.message}</p>
              </CardContent>
            </Card>
          )}
          
          {products.length > 0 && (
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Shortlisted Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <div key={product.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="aspect-square w-full bg-neutral-100 relative">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-secondary font-medium mt-1">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={updating || quote.status === "approved"}
                onClick={() => handleStatusUpdate("approved")}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve Quote
              </Button>
              
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                disabled={updating || quote.status === "in-progress"}
                onClick={() => handleStatusUpdate("in-progress")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Mark In Progress
              </Button>
              
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={updating || quote.status === "rejected"}
                onClick={() => handleStatusUpdate("rejected")}
              >
                <X className="mr-2 h-4 w-4" />
                Reject Quote
              </Button>
              
              <Link href={`mailto:${quote.email}?subject=Regarding your quote request at Tisorah`} className="w-full">
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Customer
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Quote Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">Quote Received</p>
                    <p className="text-sm text-muted-foreground">{formatDate(quote.created_at)}</p>
                  </div>
                </div>
                
                {quote.status && quote.status !== "pending" && (
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      quote.status === "approved" ? "bg-green-500" : 
                      quote.status === "in-progress" ? "bg-blue-500" :
                      "bg-red-500"
                    }`} />
                    <div>
                      <p className="font-medium">
                        {quote.status === "approved" ? "Quote Approved" : 
                         quote.status === "in-progress" ? "In Progress" :
                         "Quote Rejected"}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDate(quote.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 