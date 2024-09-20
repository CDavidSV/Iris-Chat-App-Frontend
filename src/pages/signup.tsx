import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../contexts/apiContext";
import { ButtonLoader } from "@/components/ui/buttonLoader";
import { useState } from "react";

export default function SignupPage() {
    const { signup } = useAuth();
    const redirect = useNavigate();

    const [signupLoading, setSignupLoading] = useState(false);

    const signupFormSchema = z.object({
        email: z.string().email(),
        username: z.string().min(1).max(30),
        password: z.string().min(8).max(50),
        passwordConfirmation: z.string().min(8),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords do not match",
        path: ["passwordConfirmation"]
    });

    const signupForm = useForm({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
            passwordConfirmation: '',
        }
    });

    const onSubmit = async (values: z.infer<typeof signupFormSchema>) => {
        setSignupLoading(true);
        const signupRes = await signup(values.email, values.username, values.password);
        setSignupLoading(false);

        if (signupRes) { // An error occurred server side
            // Determine the type of error
            signupRes.forEach((err) => {
                if (err.code === "EMAIL_ALREADY_REGISTERED") {
                    signupForm.setError("email", {
                        type: "manual",
                        message: "This email is already in use"
                    });
                }

                if (err.code === "USERNAME_ALREADY_REGISTERED") {
                    signupForm.setError("username", {
                        type: "manual",
                        message: "This username is already in use"
                    });
                }
            });

            return;
        }

        // Signup successful
        redirect("/friends");
    }

    return (
        <div className="flex justify-center items-center h-[100vh]">
            <Card className="border-0 sm:border">
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                        Enter your details to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...signupForm} >
                        <form onSubmit={signupForm.handleSubmit(onSubmit)} className="w-96">
                            <FormField
                                control={signupForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your email address" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signupForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your username" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Don't use your real name
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signupForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Your ultra secret password" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Must be at least 8 characters long
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signupForm.control}
                                name="passwordConfirmation"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel>Confirm your password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <ButtonLoader loading={signupLoading} className="mt-4 w-full" type="submit" loadingMsg="Signing up">Signup</ButtonLoader>
                            <p className="mt-1 text-sm">Already have an account? <Link className="font-bold underline text-blue-500" to={"/login"}>Login</Link></p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}