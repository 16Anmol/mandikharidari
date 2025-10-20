"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native"
import { router } from "expo-router"
import { ArrowLeft, Send, Camera, MessageCircle, Star } from "lucide-react-native"
import * as ImagePicker from "expo-image-picker"

const quickActions = [
  { id: 1, title: "Order Issue", icon: "📦", color: "#EF4444" },
  { id: 2, title: "Product Quality", icon: "🥬", color: "#F59E0B" },
  { id: 3, title: "Delivery Problem", icon: "🚚", color: "#8B5CF6" },
  { id: 4, title: "App Bug", icon: "🐛", color: "#EC4899" },
  { id: 5, title: "Suggestion", icon: "💡", color: "#22C55E" },
  { id: 6, title: "Compliment", icon: "👏", color: "#06B6D4" },
]

interface Message {
  id: string
  text: string
  image?: string
  timestamp: Date
  isUser: boolean
}

export default function FeedbackScreen() {
  const [message, setMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can we help you today? Feel free to share your feedback, complaints, or suggestions.",
      timestamp: new Date(),
      isUser: false,
    },
  ])
  const [rating, setRating] = useState(0)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions to attach images.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  const sendMessage = () => {
    if (!message.trim() && !selectedImage) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      image: selectedImage || undefined,
      timestamp: new Date(),
      isUser: true,
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")
    setSelectedImage(null)

    // Simulate admin response
    setTimeout(() => {
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message! We've received your feedback and will get back to you within 24 hours.",
        timestamp: new Date(),
        isUser: false,
      }
      setMessages((prev) => [...prev, adminResponse])
    }, 1000)
  }

  const handleQuickAction = (action: any) => {
    setMessage(`Regarding: ${action.title}\n\n`)
  }

  const renderMessage = (msg: Message) => (
    <View key={msg.id} style={[styles.messageContainer, msg.isUser ? styles.userMessage : styles.adminMessage]}>
      <View style={[styles.messageBubble, msg.isUser ? styles.userBubble : styles.adminBubble]}>
        {msg.image && <Image source={{ uri: msg.image }} style={styles.messageImage} />}
        <Text style={[styles.messageText, msg.isUser ? styles.userMessageText : styles.adminMessageText]}>
          {msg.text}
        </Text>
        <Text style={styles.messageTime}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Feedback & Support</Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <MessageCircle size={24} color="white" />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionBtn, { borderColor: action.color }]}
                onPress={() => handleQuickAction(action)}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Rating Section */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingTitle}>Rate your experience:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Star
                size={24}
                color={star <= rating ? "#FFD700" : "#E0E0E0"}
                fill={star <= rating ? "#FFD700" : "none"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selected Image Preview */}
      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
            <Camera size={20} color="#22C55E" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !message.trim() && !selectedImage && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!message.trim() && !selectedImage}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.charCount}>{message.length}/500</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#22C55E",
  },
  headerBtn: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 5,
  },
  onlineText: {
    fontSize: 12,
    color: "white",
    opacity: 0.8,
  },
  quickActionsContainer: {
    backgroundColor: "white",
    paddingVertical: 15,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  quickActionBtn: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    minWidth: 80,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  adminMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 15,
    padding: 12,
  },
  userBubble: {
    backgroundColor: "#22C55E",
  },
  adminBubble: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: "white",
  },
  adminMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 10,
    color: "#999",
    marginTop: 5,
    textAlign: "right",
  },
  ratingContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  ratingTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  imagePreview: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: "relative",
  },
  previewImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: "absolute",
    top: 5,
    right: 15,
    backgroundColor: "#EF4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  inputContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#CCCCCC",
  },
  charCount: {
    fontSize: 10,
    color: "#999",
    textAlign: "right",
    marginTop: 5,
  },
})
