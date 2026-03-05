"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/image-upload";

interface Product {
  id: string;
  name: string;
  image: string;
  stepsPrice: number;
  stock: number;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    stepsPrice: "",
    stock: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({ name: "", image: "", stepsPrice: "", stock: "" });
    setImageFile(null);
    setShowDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      image: product.image,
      stepsPrice: product.stepsPrice.toString(),
      stock: product.stock.toString(),
    });
    setImageFile(null);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.image.trim() || !formData.stepsPrice || formData.stock === "") {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "请填写所有字段",
      });
      return;
    }

    setSaving(true);
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products/create";

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
          stepsPrice: parseInt(formData.stepsPrice),
          stock: parseInt(formData.stock),
        }),
      });

      if (response.ok) {
        toast({
          title: editingProduct ? "更新成功" : "创建成功",
        });
        setShowDialog(false);
        await fetchProducts();
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "操作失败",
          description: data.error || "未知错误",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "网络错误，请稍后重试",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此商品吗？")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "删除成功",
        });
        await fetchProducts();
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "删除失败",
          description: data.error || "未知错误",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "网络错误，请稍后重试",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-6 py-10 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">商品管理</span>
          </h1>
          <p className="text-muted-foreground">管理商城商品</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-1">
          <Plus className="h-4 w-4" />
          添加商品
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader className="p-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">积分价格:</span>
                  <span className="font-semibold">{product.stepsPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">库存:</span>
                  <span className="font-semibold">{product.stock}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-3 w-3" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "编辑商品" : "添加商品"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? "修改商品信息" : "创建新商品"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">商品名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入商品名称"
              />
            </div>

            <div className="space-y-2">
              <Label>商品图片</Label>
              <ImageUpload
                value={formData.image}
                onChange={(value) => setFormData({ ...formData, image: value })}
                onFileChange={setImageFile}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">积分价格</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={formData.stepsPrice}
                onChange={(e) => setFormData({ ...formData, stepsPrice: e.target.value })}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">库存数量</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
