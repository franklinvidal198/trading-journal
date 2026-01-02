import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  AlertCircle,
  X
} from "lucide-react";
import { tradesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTrade, setSelectedTrade] = useState<any | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchTrades() {
      setLoading(true);
      setError("");
      try {
        const data = await tradesAPI.getTrades();
        setTrades(data);
      } catch (err) {
        setError("Failed to load trades.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrades();
  }, []);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Categorize trades
  const openTrades = trades.filter(t => t.status === "OPEN");
  const closedTrades = trades.filter(t => t.status === "CLOSED");
  const profitableTrades = closedTrades.filter(t => t.result_usd && t.result_usd > 0);
  const lossTrades = closedTrades.filter(t => t.result_usd && t.result_usd < 0);

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.pair.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || trade.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getTabTrades = () => {
    switch(activeTab) {
      case "open": return openTrades;
      case "profitable": return profitableTrades;
      case "loss": return lossTrades;
      default: return trades;
    }
  };

  const tabTrades = getTabTrades();

  return (
    <div className="space-y-6">
      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading trades...</div>
      )}
      {error && (
        <div className="text-center py-8 text-destructive">{error}</div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trades</h1>
          <p className="text-muted-foreground">Manage and analyze your trading positions</p>
        </div>
        <Button className="bg-gradient-primary hover:glow-primary transition-smooth">
          <Plus className="h-4 w-4 mr-2" />
          Add Trade
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trades by pair..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input/50 border-border/50"
              />
            </div>
            <Button variant="outline" size="sm" className="border-border/50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          {/* Phase 7: Advanced Filters - Responsive with Sheet for mobile */}
          <div className="flex gap-2 items-center">
            {/* Desktop: Collapsible filters */}
            <Collapsible open={filterOpen} onOpenChange={setFilterOpen} className="hidden md:block flex-1">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="border-border/50">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant={filterStatus === "ALL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("ALL")}
                    className={filterStatus === "ALL" ? "bg-gradient-primary" : "border-border/50"}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "OPEN" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("OPEN")}
                    className={filterStatus === "OPEN" ? "bg-gradient-accent" : "border-border/50"}
                  >
                    Open
                  </Button>
                  <Button
                    variant={filterStatus === "CLOSED" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("CLOSED")}
                    className={filterStatus === "CLOSED" ? "bg-gradient-secondary" : "border-border/50"}
                  >
                    Closed
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Mobile: Sheet filters */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm" className="border-border/50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Filter Trades</SheetTitle>
                  <SheetDescription>Select status to filter your trades</SheetDescription>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-2 py-4">
                  <Button
                    variant={filterStatus === "ALL" ? "default" : "outline"}
                    onClick={() => { setFilterStatus("ALL"); setFilterOpen(false); }}
                    className={filterStatus === "ALL" ? "bg-gradient-primary" : "border-border/50"}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "OPEN" ? "default" : "outline"}
                    onClick={() => { setFilterStatus("OPEN"); setFilterOpen(false); }}
                    className={filterStatus === "OPEN" ? "bg-gradient-accent" : "border-border/50"}
                  >
                    Open
                  </Button>
                  <Button
                    variant={filterStatus === "CLOSED" ? "default" : "outline"}
                    onClick={() => { setFilterStatus("CLOSED"); setFilterOpen(false); }}
                    className={filterStatus === "CLOSED" ? "bg-gradient-secondary" : "border-border/50"}
                  >
                    Closed
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Phase 2: Trades with Tabs Organization */}
      {!loading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">
              All ({trades.length})
            </TabsTrigger>
            <TabsTrigger value="open">
              Open ({openTrades.length})
            </TabsTrigger>
            <TabsTrigger value="profitable">
              Profitable ({profitableTrades.length})
            </TabsTrigger>
            <TabsTrigger value="loss">
              Loss ({lossTrades.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          {["all", "open", "profitable", "loss"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      {tab === "all" && "All Trades"}
                      {tab === "open" && "Open Positions"}
                      {tab === "profitable" && "Winning Trades"}
                      {tab === "loss" && "Losing Trades"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Phase 2: Accordion for Trade Details */}
                    <Accordion type="single" collapsible className="w-full">
                      {tabTrades.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No trades in this category.
                        </div>
                      ) : (
                        tabTrades.map((trade) => (
                          <AccordionItem key={trade.id} value={`trade-${trade.id}`} className="border-border/30">
                            <AccordionTrigger className="hover:no-underline px-6 py-4">
                              <div className="flex items-center justify-between w-full text-left gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="font-medium text-foreground">{trade.pair}</div>
                                  <div className="flex items-center space-x-1">
                                    {trade.direction === "BUY" ? (
                                      <TrendingUp className="h-4 w-4 text-success" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-destructive" />
                                    )}
                                    <span className={`text-sm font-medium ${
                                      trade.direction === "BUY" ? "text-success" : "text-destructive"
                                    }`}>
                                      {trade.direction}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(trade.opened_at).toLocaleDateString()}
                                </div>
                                <div className={`font-medium ${
                                  trade.result_usd && trade.result_usd > 0
                                    ? "text-success"
                                    : trade.result_usd && trade.result_usd < 0
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}>
                                  ${typeof trade.result_usd === "number" ? trade.result_usd.toFixed(2) : "-"}
                                </div>
                                <Badge
                                  variant={trade.status === "OPEN" ? "default" : "secondary"}
                                  className={trade.status === "OPEN" 
                                    ? "bg-accent/20 text-accent border-accent/30" 
                                    : "bg-muted/20 text-muted-foreground border-muted/30"
                                  }
                                >
                                  {trade.status}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 py-4 bg-muted/20">
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Entry Price</p>
                                  <p className="font-semibold text-foreground">{trade.entry_price}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Exit Price</p>
                                  <p className="font-semibold text-foreground">{trade.exit_price ?? "-"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Position Size</p>
                                  <p className="font-semibold text-foreground">{trade.position_size?.toLocaleString?.() ?? "-"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Pips</p>
                                  <p className={`font-semibold ${
                                    typeof trade.result_pips === "number" && trade.result_pips > 0 ? "text-success" : "text-destructive"
                                  }`}>
                                    {typeof trade.result_pips === "number" ? trade.result_pips : "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Risk:Reward</p>
                                  <p className="font-semibold text-foreground">{typeof trade.risk_reward === "number" ? trade.risk_reward.toFixed(2) : "-"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Result</p>
                                  <p className={`font-semibold ${
                                    trade.result_usd && trade.result_usd > 0 ? "text-success" : "text-destructive"
                                  }`}>
                                    ${typeof trade.result_usd === "number" ? trade.result_usd.toFixed(2) : "-"}
                                  </p>
                                </div>
                              </div>
                              {trade.notes && (
                                <div className="mt-4 pt-4 border-t border-border/30">
                                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                                  <p className="text-sm text-foreground">{trade.notes}</p>
                                </div>
                              )}
                              {/* Phase 4: Interactive action buttons */}
                              <div className="mt-4 flex gap-2">
                                {/* View Details Drawer */}
                                <Drawer>
                                  <DrawerTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-border/50">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </Button>
                                  </DrawerTrigger>
                                  <DrawerContent>
                                    <DrawerHeader>
                                      <DrawerTitle>{trade.pair} - Trade Details</DrawerTitle>
                                      <DrawerDescription>
                                        {trade.status === "OPEN" ? "Active Trade" : "Closed Trade"}
                                      </DrawerDescription>
                                    </DrawerHeader>
                                    <div className="p-6 space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm text-muted-foreground">Entry Price</label>
                                          <p className="text-lg font-semibold">${trade.entry_price}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-muted-foreground">Exit Price</label>
                                          <p className="text-lg font-semibold">${trade.exit_price ?? "Not exited"}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-muted-foreground">Position Size</label>
                                          <p className="text-lg font-semibold">{trade.position_size}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-muted-foreground">Result</label>
                                          <p className={`text-lg font-semibold ${trade.result_usd && trade.result_usd > 0 ? "text-success" : "text-destructive"}`}>
                                            ${trade.result_usd?.toFixed(2) || "0.00"}
                                          </p>
                                        </div>
                                      </div>
                                      {trade.notes && (
                                        <div className="border-t pt-4">
                                          <label className="text-sm text-muted-foreground">Notes</label>
                                          <p className="text-foreground mt-2">{trade.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </DrawerContent>
                                </Drawer>

                                {/* Edit Dialog */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-border/50">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Trade</DialogTitle>
                                      <DialogDescription>
                                        Update the details of this trade
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Entry Price</label>
                                        <Input defaultValue={trade.entry_price} />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Exit Price</label>
                                        <Input defaultValue={trade.exit_price || ""} />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button className="flex-1">Save Changes</Button>
                                        <Button variant="outline" className="flex-1">Cancel</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {/* Delete Alert Dialog */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="border-destructive/50 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Trade?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this {trade.pair} trade? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="bg-destructive/10 border border-destructive/20 rounded p-3 flex gap-2">
                                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                      <p className="text-sm text-destructive">This will permanently remove the trade record.</p>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

// End of file