# Clerk Authentication Setup Guide

This project has been configured with Clerk authentication for TanStack Start. Follow these steps to complete the setup:

## 1. Get Your Clerk API Keys

1. Sign up for a free account at [clerk.com](https://clerk.com)
2. Create a new application in the Clerk Dashboard
3. Navigate to the **API Keys** section
4. Copy your **Publishable Key** and **Secret Key**

## 2. Configure Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
# Clerk Authentication Keys
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

Replace the placeholder values with your actual keys from the Clerk Dashboard.

## 3. Configure Authentication URLs (Optional)

In your Clerk Dashboard, you may want to configure:
- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/dashboard`
- **After sign-up URL**: `/dashboard`

## 4. Run the Application

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your application with Clerk authentication.

## Features Implemented

### 1. **Public Pages**
- Home page (`/`) - Shows different content for signed-in and signed-out users
- Sign-in page (`/sign-in`)
- Sign-up page (`/sign-up`)

### 2. **Protected Pages**
- Dashboard (`/dashboard`) - Server-side protected route that requires authentication

### 3. **Components**
- `<UserButton />` - Displays user avatar with dropdown menu
- `<SignedIn />` - Shows content only when user is authenticated
- `<SignedOut />` - Shows content only when user is not authenticated
- `<SignInButton />` - Button to trigger sign-in flow

### 4. **Server-Side Protection**
The dashboard route demonstrates server-side authentication checking:
```typescript
const authStateFn = createServerFn({ method: "GET" }).handler(async () => {
  const request = getWebRequest();
  const { userId } = await getAuth(request);
  
  if (!userId) {
    throw redirect({ to: "/sign-in" });
  }
  
  return { userId };
});
```

## Customization

### Styling the Auth Components
You can customize Clerk components using the appearance prop:
```typescript
<SignIn 
  appearance={{
    elements: {
      formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
      card: "shadow-lg"
    }
  }}
/>
```

### Adding More Protected Routes
To protect additional routes, use the same pattern as the dashboard:
1. Create a server function to check authentication
2. Use `beforeLoad` to run the check before rendering
3. Redirect to sign-in if not authenticated

## Troubleshooting

1. **"Missing API Keys" Error**: Ensure your `.env` file exists and contains valid keys
2. **"User not authenticated" on protected routes**: Make sure cookies are enabled and you're signed in
3. **Styling issues**: Clerk components come with default styles that can be customized via the appearance prop

## Learn More

- [Clerk Documentation](https://clerk.com/docs)
- [TanStack Start + Clerk Guide](https://clerk.com/docs/quickstarts/tanstack-react-start)
- [Clerk Components Reference](https://clerk.com/docs/components/overview)
